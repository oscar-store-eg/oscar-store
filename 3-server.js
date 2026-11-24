// OSCAR backend: zero-dependency Node 22 server, SQLite storage, REST API, admin dashboard.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm');
const {DatabaseSync}=require('node:sqlite');
const PORT=+process.env.PORT||8080, DATA=process.env.DATA_DIR||path.join(__dirname,'data');
fs.mkdirSync(DATA,{recursive:true});fs.mkdirSync(path.join(DATA,'uploads'),{recursive:true});
const db=new DatabaseSync(path.join(DATA,'oscar.db'));
db.exec('CREATE TABLE IF NOT EXISTS docs(kind TEXT,id TEXT,json TEXT,PRIMARY KEY(kind,id))');
const q={get:db.prepare('SELECT json FROM docs WHERE kind=? AND id=?'),all:db.prepare('SELECT json FROM docs WHERE kind=?'),put:db.prepare('INSERT OR REPLACE INTO docs(kind,id,json) VALUES(?,?,?)'),del:db.prepare('DELETE FROM docs WHERE kind=? AND id=?')};
const get=(k,id)=>{const r=q.get.get(k,String(id));return r?JSON.parse(r.json):null};
const all=k=>q.all.all(k).map(r=>JSON.parse(r.json));
const put=(k,id,o)=>{q.put.run(k,String(id),JSON.stringify(o));return o};
const del=(k,id)=>q.del.run(k,String(id));
const tx=fn=>{db.exec('BEGIN');try{const r=fn();db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}};
// ---- seed (first run) ----
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'seed-data.js'),'utf8')+';this.OSC=OSC',ctx);const OSC=ctx.OSC;
if(!get('meta','seeded')){tx(()=>{
  OSC.cats.forEach(c=>put('cats',c.id,c));OSC.BANNERS.forEach(b=>put('banners',b.id,b));OSC.COUPONS.forEach(c=>put('coupons',c.code,c));
  put('meta','settings',{returnDays:14,freeShip:2000,expressFee:40,zones:OSC.ZONES});
  put('meta','seq',{order:1000,product:1000,review:5000,user:1,banner:100,ret:100});
  if(process.env.SEED_DEMO==='1'){OSC.products.forEach(p=>put('products',p.id,p));OSC.reviews.forEach(r=>put('reviews',r.id,r))}
  put('meta','seeded',{at:Date.now()});});}
// optional first-run catalog from ./seed (products.json + uploads/)
try{const sp=path.join(__dirname,'seed','products.json');if(fs.existsSync(sp)&&!get('meta','seededCatalog')){const list=JSON.parse(fs.readFileSync(sp,'utf8'));const up=path.join(__dirname,'seed','uploads');
  tx(()=>{list.forEach(p=>put('products',p.id,p));const sq=get('meta','seq');sq.product=Math.max(sq.product,...list.map(p=>p.id));put('meta','seq',sq);put('meta','seededCatalog',{n:list.length,at:Date.now()})});
  if(fs.existsSync(up))fs.readdirSync(up).forEach(f=>fs.copyFileSync(path.join(up,f),path.join(DATA,'uploads',f)));
  const uj=path.join(__dirname,'seed','uploads.json');if(fs.existsSync(uj)){const m=JSON.parse(fs.readFileSync(uj,'utf8'));Object.keys(m).forEach(f=>fs.writeFileSync(path.join(DATA,'uploads',path.basename(f)),Buffer.from(m[f],'base64')))}console.log('Loaded',list.length,'seed products')}}catch(e){console.log('seed catalog failed',e.message)}
const nextId=k=>{const s=get('meta','seq');s[k]++;put('meta','seq',s);return s[k]};
// ---- admin credential ----
let ADMIN_PW=process.env.ADMIN_PASSWORD;
if(!ADMIN_PW){const f=path.join(DATA,'admin-password.txt');if(fs.existsSync(f))ADMIN_PW=fs.readFileSync(f,'utf8').trim();else{ADMIN_PW=crypto.randomBytes(9).toString('base64url');fs.writeFileSync(f,ADMIN_PW,{mode:0o600});console.log('Generated admin password saved in',f)}}
// ---- helpers ----
const hashPw=(pw,salt)=>crypto.scryptSync(pw,salt,32).toString('hex');
const tokens=new Map(); // token -> {uid|admin, at}
function mkToken(info){const t=crypto.randomBytes(24).toString('hex');put('sessions',t,Object.assign({at:Date.now()},info));return t}
function auth(req){const h=req.headers.authorization||'';const t=h.startsWith('Bearer ')?h.slice(7):'';if(!t)return null;const s=get('sessions',t);if(!s||Date.now()-s.at>30*864e5)return null;return s}
const J=(res,code,o)=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS'});res.end(JSON.stringify(o))};
const bad=(res,msg,code=400)=>J(res,code,{error:msg});
function body(req){return new Promise((ok,no)=>{let b='',n=0;req.on('data',c=>{n+=c.length;if(n>12e6){no(new Error('too large'));req.destroy()}else b+=c});req.on('end',()=>{try{ok(b?JSON.parse(b):{})}catch(e){no(e)}});})}
const validPhone=p=>/^01[0125][0-9]{8}$/.test(p),validEmail=e=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
const pub=u=>u&&({id:u.id,name:u.name,phone:u.phone,email:u.email,addresses:u.addresses||[],createdAt:u.createdAt,deleteRequested:u.deleteRequested||null});
const stk=(p,c,s)=>(p.stock&&p.stock[c+'|'+s])||0;
const rate=new Map();function limited(key,max=10,win=6e4){const n=Date.now(),a=(rate.get(key)||[]).filter(t=>n-t<win);a.push(n);rate.set(key,a);return a.length>max}
// ---- pricing / coupons (authoritative) ----
function couponCheck(code,items,sub,uid){
  code=(code||'').trim().toUpperCase();const cp=get('coupons',code);if(!cp||cp.active===false)return{ok:false,error:'Invalid coupon code'};
  const today=new Date().toISOString().slice(0,10);if(cp.start&&today<cp.start)return{ok:false,error:'Coupon not active yet'};if(cp.end&&today>cp.end)return{ok:false,error:'Coupon expired'};
  const used=all('couponUse').filter(x=>x.code===code);if(cp.max&&used.length>=cp.max)return{ok:false,error:'Coupon usage limit reached'};
  if(cp.firstOrder||cp.perUser){const mine=used.filter(x=>x.uid===uid).length;if(mine>=(cp.firstOrder?1:cp.perUser))return{ok:false,error:'Coupon already used the maximum times'};
    if(cp.firstOrder&&all('orders').some(o=>o.uid===uid&&o.status!=='Cancelled'))return{ok:false,error:'Coupon is for first order only'}}
  let base=sub;if(cp.cat){base=items.reduce((a,i)=>a+(i.p.cats.includes(cp.cat)?i.p.price*i.qty:0),0);if(base<=0)return{ok:false,error:'No eligible items'}}
  if(sub<(cp.min||0))return{ok:false,error:'Minimum order '+cp.min+' EGP'};
  return{ok:true,discount:cp.type==='pct'?Math.round(base*cp.val/100):Math.min(cp.val,base),cp};
}
function calc(items,gov,method,coupon,uid){
  const st=get('meta','settings');let sub=0;items.forEach(i=>sub+=i.p.price*i.qty);
  const cc=coupon?couponCheck(coupon,items,sub,uid):null;const disc=cc&&cc.ok?cc.discount:0,after=sub-disc;
  const g=OSC.GOV[gov]||OSC.GOV[0],z=st.zones[g[2]];let ship=z.std+(method==='exp'?st.expressFee:0);if(after>=st.freeShip)ship=method==='exp'?st.expressFee:0;
  return{sub,cc,disc,ship,total:after+ship,days:z.days};
}
function notify(uid,en,ar,bEn,bAr,kind){const id=Date.now()+'-'+Math.random().toString(36).slice(2,6);put('notifs',id,{id,uid,tEn:en,tAr:ar,bEn,bAr,kind,t:Date.now(),read:false})}
const STAT=['Pending','Confirmed','Processing','Packed','Shipped','Out for Delivery','Delivered','Cancelled'];
const STAT_AR={Pending:'قيد الانتظار',Confirmed:'تم التأكيد',Processing:'قيد التجهيز',Packed:'تم التغليف',Shipped:'تم الشحن','Out for Delivery':'خرج للتوصيل',Delivered:'تم التسليم',Cancelled:'ملغي'};
function setStatus(o,s,note){
  if(o.status==='Cancelled'||o.status==='Delivered'&&s!=='Delivered')throw new Error('Order is final');
  tx(()=>{o.status=s;o.hist.push({s,t:Date.now(),note:note||''});
    if(s==='Cancelled'){o.items.forEach(i=>{const p=get('products',i.pid);if(p){p.stock[i.color+'|'+i.size]=(p.stock[i.color+'|'+i.size]||0)+i.qty;put('products',p.id,p)}});
      all('couponUse').filter(x=>x.order===o.id).forEach(x=>del('couponUse',x.order))}
    if(s==='Delivered'){o.payStatus='paid';o.deliveredAt=Date.now()}
    put('orders',o.id,o);notify(o.uid,'Order '+o.id+': '+s,'الطلب '+o.id+': '+STAT_AR[s],'Your order status changed to '+s+'.','حالة طلبك بقت '+STAT_AR[s]+'.','order')});
}
function placeOrder(u,b){
  if(!Array.isArray(b.items)||!b.items.length||b.items.length>50)throw new Error('Empty cart');
  const a=b.addr||{};if(!b.name||!validPhone(b.phone||'')||!a.street||!(a.gov>=0&&a.gov<OSC.GOV.length))throw new Error('Missing name, phone or address');
  return tx(()=>{
    const items=b.items.map(i=>{const p=get('products',i.pid);const qty=Math.floor(+i.qty);if(!p||!p.active||!(qty>0))throw new Error('Item unavailable');if(stk(p,i.color,i.size)<qty)throw new Error('Out of stock: '+p.en+' '+i.color+' '+i.size);return{p,color:i.color,size:i.size,qty}});
    const merged={};items.forEach(i=>{const k=i.p.id+i.color+i.size;if(merged[k])merged[k].qty+=i.qty;else merged[k]=i});
    Object.values(merged).forEach(i=>{if(stk(i.p,i.color,i.size)<i.qty)throw new Error('Out of stock: '+i.p.en)});
    const t=calc(items,a.gov,b.ship,b.coupon,u.id);const id='OSC-'+nextId('order');
    items.forEach(i=>{const p=get('products',i.p.id);p.stock[i.color+'|'+i.size]-=i.qty;p.sales=(p.sales||0)+i.qty;put('products',p.id,p)});
    const o={id,uid:u.id,items:items.map(i=>({pid:i.p.id,en:i.p.en,ar:i.p.ar,sku:i.p.sku,color:i.color,size:i.size,qty:i.qty,price:i.p.price,old:i.p.old})),
      name:b.name,phone:b.phone,email:b.email||u.email,addr:a,ship:b.ship==='exp'?'exp':'std',shipCost:t.ship,days:t.days,sub:t.sub,disc:t.disc,coupon:t.cc&&t.cc.ok?t.cc.cp.code:'',total:t.total,pay:'cod',payStatus:'pending',status:'Pending',hist:[{s:'Pending',t:Date.now()}],t:Date.now()};
    if(o.coupon)put('couponUse',id,{code:o.coupon,uid:u.id,order:id});put('orders',id,o);
    notify(u.id,'Order '+id+' received','تم استلام طلبك '+id,'We got your order. Total '+o.total+' EGP, cash on delivery.','استلمنا طلبك. الإجمالي '+o.total+' جنيه، الدفع عند الاستلام.','order');return o});
}
// ---- static ----
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
function serve(res,file){fs.readFile(file,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream','cache-control':'no-cache'});res.end(d)})}
// ---- router ----
const routes=[];const R=(m,re,fn)=>routes.push([m,new RegExp('^'+re+'$'),fn]);
R('GET','/api/catalog',(c)=>{const prods=all('products').filter(p=>p.active);const st=get('meta','settings');
  return{products:prods,cats:all('cats'),banners:all('banners'),coupons:all('coupons').filter(x=>x.active!==false).map(({code,type,val,min,en,ar,cat,firstOrder,start,end})=>({code,type,val,min,en,ar,cat,firstOrder,start,end})),reviews:all('reviews'),settings:{returnDays:st.returnDays,freeShip:st.freeShip,expressFee:st.expressFee},zones:st.zones,gov:OSC.GOV,at:Date.now()}});
R('POST','/api/register',async(c)=>{const b=c.b;if(limited('reg'+c.ip,5))throw new E('Too many attempts',429);
  const name=(b.name||'').trim(),phone=(b.phone||'').trim(),email=(b.email||'').trim().toLowerCase();
  if(name.length<2||!validPhone(phone)||!validEmail(email)||(b.password||'').length<6)throw new E('Check name, phone (01XXXXXXXXX), email and password (6+ chars)');
  if(all('users').some(u=>u.email===email||u.phone===phone))throw new E('Email or phone already registered',409);
  const salt=crypto.randomBytes(8).toString('hex');const id=nextId('user');const u=put('users',id,{id,name,phone,email,salt,hash:hashPw(b.password,salt),createdAt:Date.now(),addresses:[]});return{token:mkToken({uid:id}),user:pub(u)}});
R('POST','/api/login',async(c)=>{if(limited('login'+c.ip,10))throw new E('Too many attempts',429);const id=(c.b.id||'').trim().toLowerCase();
  const u=all('users').find(x=>x.email===id||x.phone===id);if(!u||u.hash!==hashPw(c.b.password||'',u.salt))throw new E('Wrong email/phone or password',401);return{token:mkToken({uid:u.id}),user:pub(u)}});
const needUser=c=>{if(!c.s||!c.s.uid)throw new E('Sign in required',401);const u=get('users',c.s.uid);if(!u)throw new E('Sign in required',401);return u};
R('POST','/api/logout',c=>{const h=c.s&&(c.headers.authorization||'').slice(7);if(h)del('sessions',h);return{ok:true}});
R('GET','/api/me',c=>pub(needUser(c)));
R('PUT','/api/me',c=>{const u=needUser(c),b=c.b;if(b.name)u.name=String(b.name).slice(0,80);if(b.phone&&b.phone!==u.phone){if(!validPhone(b.phone))throw new E('Invalid phone');if(all('users').some(x=>x.id!==u.id&&x.phone===b.phone))throw new E('Phone already used',409);u.phone=b.phone}
  if(b.email!==undefined&&String(b.email).toLowerCase()!==u.email){const e=String(b.email).trim().toLowerCase();if(!validEmail(e))throw new E('Invalid email');if(all('users').some(x=>x.id!==u.id&&x.email===e))throw new E('Email already used',409);u.email=e}if(Array.isArray(b.addresses))u.addresses=b.addresses.slice(0,10);
  if(b.newPassword){if(u.hash!==hashPw(b.oldPassword||'',u.salt))throw new E('Wrong current password',401);if(b.newPassword.length<6)throw new E('Password too short');u.salt=crypto.randomBytes(8).toString('hex');u.hash=hashPw(b.newPassword,u.salt)}put('users',u.id,u);return pub(u)});
R('GET','/api/orders',c=>{const u=needUser(c);return all('orders').filter(o=>o.uid===u.id).sort((a,b)=>b.t-a.t)});
R('POST','/api/orders',c=>{const u=needUser(c);return{order:placeOrder(u,c.b)}});
R('POST','/api/orders/([A-Z0-9-]+)/cancel',c=>{const u=needUser(c),o=get('orders',c.m[1]);if(!o||o.uid!==u.id)throw new E('Not found',404);if(!['Pending','Confirmed'].includes(o.status))throw new E('Order can no longer be cancelled');setStatus(o,'Cancelled','customer');return o});
R('POST','/api/returns',c=>{const u=needUser(c),b=c.b,o=get('orders',String(b.orderId||''));if(!o||o.uid!==u.id)throw new E('Order not found',404);const st=get('meta','settings');
  if(o.status!=='Delivered'||Date.now()-(o.deliveredAt||0)>st.returnDays*864e5)throw new E('Not eligible for return');const idx=+b.itemIdx|0,it=o.items[idx];if(!it)throw new E('Bad item');
  if(all('returns').some(r=>r.orderId===o.id&&r.itemIdx===idx&&r.status!=='Rejected'))throw new E('A request for this item already exists');
  const ty=['return','size','color'].includes(b.type)?b.type:'return';const id='RET-'+nextId('ret');
  const r=put('returns',id,{id,uid:u.id,orderId:o.id,itemIdx:idx,item:it,type:ty,reason:String(b.reason||'').slice(0,200),notes:String(b.notes||'').slice(0,500),newColor:String(b.newColor||''),newSize:String(b.newSize||''),status:'Requested',t:Date.now()});
  notify(u.id,'Return request '+id,'طلب استرجاع '+id,'We received your request and will review it.','استلمنا طلبك وهنراجعه.','order');return r});
R('GET','/api/returns',c=>{const u=needUser(c);return all('returns').filter(r=>r.uid===u.id)});
R('GET','/api/notifications',c=>{const u=needUser(c);return all('notifs').filter(n=>n.uid===u.id||n.uid===0).sort((a,b)=>b.t-a.t).slice(0,50)});
R('POST','/api/reviews',c=>{const u=needUser(c),b=c.b,pid=+b.pid;const ok=all('orders').some(o=>o.uid===u.id&&o.status==='Delivered'&&o.items.some(i=>i.pid===pid));if(!ok)throw new E('Only buyers can review');
  const st=Math.max(1,Math.min(5,+b.st|0));const id=nextId('review');put('reviews',id,{id,pid,uid:u.id,userName:[u.name,u.name],st,en:String(b.text||'').slice(0,500),ar:String(b.text||'').slice(0,500),t:Date.now(),verified:true});
  const rs=all('reviews').filter(r=>r.pid===pid),p=get('products',pid);if(p){p.rcount=rs.length;p.rating=+(rs.reduce((a,r)=>a+r.st,0)/rs.length).toFixed(1);put('products',pid,p)}return{ok:true}});
function recalc(pid){const rs=all('reviews').filter(r=>r.pid===pid),p=get('products',pid);if(p){p.rcount=rs.length;p.rating=rs.length?+(rs.reduce((a,r)=>a+r.st,0)/rs.length).toFixed(1):0;put('products',pid,p)}}
R('PUT','/api/reviews/(\\d+)',c=>{const u=needUser(c),r=get('reviews',c.m[1]);if(!r||r.uid!==u.id)throw new E('Not found',404);r.st=Math.max(1,Math.min(5,+c.b.st|0));r.en=r.ar=String(c.b.text||'').slice(0,500);put('reviews',r.id,r);recalc(r.pid);return{ok:true}});
R('DELETE','/api/reviews/(\\d+)',c=>{const u=needUser(c),r=get('reviews',c.m[1]);if(!r||r.uid!==u.id)throw new E('Not found',404);del('reviews',r.id);recalc(r.pid);return{ok:true}});
R('POST','/api/me/delete-request',c=>{const u=needUser(c);u.deleteRequested=Date.now();put('users',u.id,u);return{ok:true}});
// ---- admin ----
R('POST','/api/admin/login',c=>{if(limited('adm'+c.ip,8))throw new E('Too many attempts',429);const a=Buffer.from(c.b.password||''),b=Buffer.from(ADMIN_PW);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))throw new E('Wrong password',401);return{token:mkToken({admin:true})}});
const needAdmin=c=>{if(!c.s||!c.s.admin)throw new E('Admin only',401)};
R('GET','/api/admin/stats',c=>{needAdmin(c);const o=all('orders'),p=all('products');const day=Date.now()-864e5;
  return{orders:o.length,pending:o.filter(x=>x.status==='Pending').length,revenue:o.filter(x=>x.status!=='Cancelled').reduce((a,x)=>a+x.total,0),today:o.filter(x=>x.t>day).length,customers:all('users').length,products:p.length,lowStock:p.filter(x=>x.active&&Object.values(x.stock||{}).reduce((a,b)=>a+b,0)<=5).map(x=>({id:x.id,en:x.en}))}});
R('GET','/api/admin/products',c=>{needAdmin(c);return all('products')});
R('POST','/api/admin/products',c=>{needAdmin(c);const b=c.b;const id=b.id||nextId('product');const old=get('products',id)||{};const p=Object.assign({sales:0,rating:0,rcount:0,age:0,images:[]},old,b,{id:+id});
  if(!p.en||!p.ar||!(p.price>0))throw new E('Name (EN+AR) and price are required');p.colors=p.colors||[];p.sizes=p.sizes||[];p.stock=p.stock||{};p.cats=p.cats||[p.cat].filter(Boolean);p.sku=p.sku||'OSC-'+id;if(p.active===undefined)p.active=true;if(!old.id)p.age=Date.now();delete p.demo;return put('products',p.id,p)});
R('DELETE','/api/admin/products/(\\d+)',c=>{needAdmin(c);del('products',c.m[1]);return{ok:true}});
R('GET','/api/admin/orders',c=>{needAdmin(c);return all('orders').sort((a,b)=>b.t-a.t)});
R('POST','/api/admin/orders/([A-Z0-9-]+)/status',c=>{needAdmin(c);const o=get('orders',c.m[1]);if(!o)throw new E('Not found',404);if(!STAT.includes(c.b.status))throw new E('Bad status');setStatus(o,c.b.status,'admin');return o});
R('GET','/api/admin/returns',c=>{needAdmin(c);return all('returns')});
const RET_STAT=['Requested','Approved','Picked up','Completed','Rejected'],RET_AR={Requested:'تم الطلب',Approved:'تمت الموافقة','Picked up':'تم الاستلام',Completed:'مكتمل',Rejected:'مرفوض'};
R('POST','/api/admin/returns/([A-Z0-9-]+)',c=>{needAdmin(c);const r=get('returns',c.m[1]);if(!r)throw new E('Not found',404);const s2=String(c.b.status);if(!RET_STAT.includes(s2))throw new E('Bad status');
  tx(()=>{r.status=s2;if(s2==='Completed'&&r.type==='return'&&!r.restocked&&c.b.restock!==false){const p=get('products',r.item.pid);if(p){const k=r.item.color+'|'+r.item.size;p.stock[k]=(p.stock[k]||0)+r.item.qty;put('products',p.id,p)}r.restocked=true;
      const o=get('orders',r.orderId);if(o&&o.items.length===1){o.status='Returned';o.hist.push({s:'Returned',t:Date.now(),note:'admin'});put('orders',o.id,o)}}
    put('returns',r.id,r);notify(r.uid,'Return '+r.id+': '+s2,'الاسترجاع '+r.id+': '+RET_AR[s2],'Status updated.','تم تحديث الحالة.','order')});return r});
R('GET','/api/admin/customers',c=>{needAdmin(c);return all('users').map(pub)});
R('GET','/api/admin/(cats|banners|coupons)',c=>{needAdmin(c);return all(c.m[1])});
R('POST','/api/admin/(cats|banners|coupons)',c=>{needAdmin(c);const k=c.m[1],b=c.b,key=k==='coupons'?String(b.code||'').toUpperCase():String(b.id||'');if(!key)throw new E('id/code required');if(k==='coupons')b.code=key;return put(k,key,b)});
R('DELETE','/api/admin/(cats|banners|coupons)/([^/]+)',c=>{needAdmin(c);del(c.m[1],decodeURIComponent(c.m[2]));return{ok:true}});
R('GET','/api/admin/settings',c=>{needAdmin(c);return get('meta','settings')});
R('PUT','/api/admin/settings',c=>{needAdmin(c);const s=Object.assign(get('meta','settings'),c.b);return put('meta','settings',s)});
R('POST','/api/admin/upload',c=>{needAdmin(c);const m=/^data:image\/(png|jpeg|webp);base64,(.+)$/.exec(c.b.data||'');if(!m)throw new E('PNG/JPEG/WEBP data URL required');const buf=Buffer.from(m[2],'base64');if(buf.length>8e6)throw new E('Image too large');
  const name=crypto.randomBytes(8).toString('hex')+'.'+(m[1]==='jpeg'?'jpg':m[1]);fs.writeFileSync(path.join(DATA,'uploads',name),buf);return{url:'/uploads/'+name}});
class E extends Error{constructor(m,code=400){super(m);this.code=code}}
http.createServer(async(req,res)=>{
  try{const u=new URL(req.url,'http://x');const p=u.pathname;
    if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS'});return res.end()}
    if(p.startsWith('/api/')){
      for(const [m,re,fn] of routes){if(m!==req.method)continue;const mm=re.exec(p);if(!mm)continue;
        const c={m:mm,headers:req.headers,s:auth(req),ip:req.socket.remoteAddress,b:req.method==='GET'||req.method==='DELETE'?{}:await body(req)};
        try{return J(res,200,await fn(c))}catch(e){return bad(res,e.message,e instanceof E?e.code:400)}}
      return bad(res,'Not found',404)}
    if(p.startsWith('/uploads/')){const f=path.join(DATA,'uploads',path.basename(p));return serve(res,f)}
    if(p==='/'||p==='/admin'||p==='/admin/')return serve(res,path.join(__dirname,'public','admin.html'));
    return serve(res,path.join(__dirname,'public',path.basename(p)));
  }catch(e){J(res,500,{error:'Server error'})}
}).listen(PORT,()=>console.log('OSCAR server on',PORT));
