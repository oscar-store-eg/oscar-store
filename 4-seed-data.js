/* OSCAR demo catalog: generated deterministically; stored into the local database on first launch. */
var OSC = {};
(function () {
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var R = rng(20261124);
  function ri(a, b) { return a + Math.floor(R() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(R() * a.length)]; }

  var COLORS = {
    black: ['Black', 'أسود', '#1c1c1c'], white: ['Off White', 'أوف وايت', '#f3efe6'], beige: ['Beige', 'بيج', '#d6c2a2'],
    navy: ['Navy', 'كحلي', '#1f2a44'], olive: ['Olive', 'زيتي', '#6b705c'], burgundy: ['Burgundy', 'عنابي', '#6d2332'],
    grey: ['Grey', 'رمادي', '#8c8c8c'], camel: ['Camel', 'جملي', '#b08968'], sand: ['Sand', 'رملي', '#e3d3b4'],
    denim: ['Denim Blue', 'أزرق جينز', '#4a6fa5'], lightdenim: ['Light Denim', 'جينز فاتح', '#8fb0d6'], brown: ['Brown', 'بني', '#5c4033'],
    pink: ['Blush', 'وردي هادئ', '#e5b8b0'], forest: ['Forest', 'أخضر غامق', '#2f4a3a'], red: ['Red', 'أحمر', '#b3202a'], sky: ['Sky', 'سماوي', '#9cc5e0']
  };
  var CLOTH = ['black', 'white', 'beige', 'navy', 'olive', 'burgundy', 'grey', 'camel', 'sand', 'forest'];
  var DENIM = ['denim', 'lightdenim', 'black', 'grey', 'navy'];
  var KIDC = ['sky', 'pink', 'red', 'navy', 'sand', 'olive', 'white'];
  var LEATH = ['black', 'brown', 'camel', 'beige', 'white', 'burgundy'];

  var SZ = {
    men: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'], women: ['XS', 'S', 'M', 'L', 'XL'], kid: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
    baby: ['0-3M', '3-6M', '6-12M', '12-18M'], menshoe: ['40', '41', '42', '43', '44', '45'], womenshoe: ['36', '37', '38', '39', '40', '41'],
    kidshoe: ['28', '29', '30', '31', '32', '33', '34'], one: ['One Size'], belt: ['85', '95', '105', '115'], menjeans: ['30', '32', '34', '36', '38'], womenjeans: ['26', '28', '30', '32', '34']
  };

  var cats = [
    { id: 'men', en: 'Men', ar: 'رجالي' }, { id: 'women', en: 'Women', ar: 'حريمي' }, { id: 'kids', en: 'Kids', ar: 'أطفال' },
    { id: 'shoes', en: 'Shoes', ar: 'أحذية' }, { id: 'bags', en: 'Bags', ar: 'شنط' }, { id: 'acc', en: 'Accessories', ar: 'إكسسوارات' },
    { id: 'sport', en: 'Sportswear', ar: 'ملابس رياضية' },
    { id: 'new', en: 'New Arrivals', ar: 'وصل حديثاً', virtual: 'isNew' }, { id: 'best', en: 'Best Sellers', ar: 'الأكثر مبيعاً', virtual: 'isBest' },
    { id: 'offers', en: 'Special Offers', ar: 'عروض خاصة', virtual: 'sale' }
  ];
  cats.forEach(function (c, i) { c.parent = null; c.order = i; c.visible = true; });

  var LEAVES = [
    'men-tee|men|T-Shirts|تيشيرتات|tee|350|750|men|CLOTH|T-Shirt|تيشيرت||OSCAR',
    'men-shirt|men|Shirts|قمصان|shirt|550|1200|men|CLOTH|Shirt|قميص||OSCAR',
    'men-hood|men|Hoodies|هوديز|hoodie|700|1500|men|CLOTH|Hoodie|هودي||OSCAR',
    'men-sweat|men|Sweatshirts|سويت شيرتات|sweat|600|1300|men|CLOTH|Sweatshirt|سويت شيرت||OSCAR',
    'men-jacket|men|Jackets|جاكيتات|jacket|1200|3200|men|CLOTH|Jacket|جاكت||OSCAR Studio',
    'men-jeans|men|Jeans|جينز|jeans|800|1800|menjeans|DENIM|Jeans|بنطلون جينز||OSCAR',
    'men-trousers|men|Trousers|بناطيل|trousers|700|1600|menjeans|CLOTH|Trousers|بنطلون||OSCAR',
    'men-shorts|men|Shorts|شورتات|shorts|400|900|men|CLOTH|Shorts|شورت||OSCAR',
    'men-under|men|Underwear|ملابس داخلية|boxer|250|550|men|CLOTH|Boxer Set|طقم بوكسر||OSCAR',
    'men-sport|men|Sportswear|ملابس رياضية|tee|450|1100|men|CLOTH|Training Top|تيشيرت تدريب|sport|OSCAR Active',
    'men-shoes|men|Shoes|أحذية|sneaker|1100|2800|menshoe|LEATH|Sneakers|حذاء سنيكرز|shoes|OSCAR Studio',
    'men-acc|men|Accessories|إكسسوارات|belt|300|900|one|LEATH|Leather Belt|حزام جلد|acc|OSCAR',
    'women-dress|women|Dresses|فساتين|dress|900|2600|women|CLOTH|Dress|فستان||OSCAR Studio',
    'women-top|women|Tops|توبات|top|350|800|women|CLOTH|Top|توب||OSCAR',
    'women-blouse|women|Blouses|بلوزات|blouse|500|1100|women|CLOTH|Blouse|بلوزة||OSCAR',
    'women-jeans|women|Jeans|جينز|jeans|800|1700|womenjeans|DENIM|Jeans|بنطلون جينز||OSCAR',
    'women-trousers|women|Trousers|بناطيل|trousers|700|1500|women|CLOTH|Trousers|بنطلون||OSCAR',
    'women-skirt|women|Skirts|جيبات|skirt|500|1200|women|CLOTH|Skirt|جيبة||OSCAR Studio',
    'women-jacket|women|Jackets|جاكيتات|jacket|1200|3000|women|CLOTH|Jacket|جاكت||OSCAR Studio',
    'women-sport|women|Sportswear|ملابس رياضية|leggings|450|1100|women|CLOTH|Leggings|ليجينز|sport|OSCAR Active',
    'women-shoes|women|Shoes|أحذية|heel|1000|2600|womenshoe|LEATH|Heels|كعب عالي|shoes|OSCAR Studio',
    'women-bags|women|Bags|شنط|handbag|900|3200|one|LEATH|Handbag|شنطة يد|bags|OSCAR Studio',
    'kids-boys|kids|Boys|أولاد|tee|250|650|kid|KIDC|Boys T-Shirt|تيشيرت أولاد||OSCAR Kids',
    'kids-girls|kids|Girls|بنات|dress|350|850|kid|KIDC|Girls Dress|فستان بنات||OSCAR Kids',
    'kids-baby|kids|Baby Clothes|ملابس أطفال رضّع|onesie|200|500|baby|KIDC|Baby Bodysuit|بودي رضّع||OSCAR Kids',
    'kids-shoes|kids|Kids Shoes|أحذية أطفال|sneaker|450|950|kidshoe|KIDC|Kids Sneakers|حذاء أطفال|shoes|OSCAR Kids',
    'kids-acc|kids|Kids Accessories|إكسسوارات أطفال|cap|150|400|one|KIDC|Cap|كاب||OSCAR Kids',
    'shoes-sneakers|shoes|Sneakers|سنيكرز|sneaker|1200|2900|menshoe|LEATH|Sneakers|سنيكرز||OSCAR Studio',
    'shoes-casual|shoes|Casual Shoes|أحذية كاجوال|loafer|1000|2400|menshoe|LEATH|Casual Shoes|حذاء كاجوال||OSCAR',
    'shoes-sports|shoes|Sports Shoes|أحذية رياضية|runner|1100|2600|menshoe|LEATH|Running Shoes|حذاء جري||OSCAR Active',
    'shoes-formal|shoes|Formal Shoes|أحذية رسمية|loafer|1500|3400|menshoe|LEATH|Formal Shoes|حذاء رسمي||OSCAR Studio',
    'bags-hand|bags|Handbags|شنط يد|handbag|1100|3500|one|LEATH|Handbag|شنطة يد||OSCAR Studio',
    'bags-back|bags|Backpacks|شنط ظهر|backpack|700|1800|one|LEATH|Backpack|شنطة ظهر||OSCAR',
    'bags-shoulder|bags|Shoulder Bags|شنط كتف|shoulder|900|2600|one|LEATH|Shoulder Bag|شنطة كتف||OSCAR Studio',
    'acc-watch|acc|Watches|ساعات|watch|1500|4500|one|LEATH|Watch|ساعة||OSCAR',
    'acc-sun|acc|Sunglasses|نظارات شمس|glasses|500|1400|one|LEATH|Sunglasses|نظارة شمس||OSCAR',
    'acc-belt|acc|Belts|أحزمة|belt|300|900|belt|LEATH|Belt|حزام||OSCAR',
    'acc-wallet|acc|Wallets|محافظ|wallet|350|1100|one|LEATH|Wallet|محفظة||OSCAR',
    'acc-fash|acc|Fashion Accessories|إكسسوارات موضة|necklace|250|900|one|LEATH|Necklace|عقد||OSCAR Studio',
    'sport-tops|sport|Training Tops|تيشيرتات تدريب|tee|400|950|men|CLOTH|Training Top|تيشيرت تدريب||OSCAR Active',
    'sport-leg|sport|Leggings & Shorts|ليجينز وشورتات|leggings|400|900|women|CLOTH|Active Leggings|ليجينز رياضي||OSCAR Active',
    'sport-track|sport|Tracksuits|ترينجات|hoodie|900|1900|men|CLOTH|Track Jacket|جاكت ترينج||OSCAR Active'
  ];
  var order = 0;
  var leafDefs = LEAVES.map(function (s) {
    var p = s.split('|');
    var d = { id: p[0], parent: p[1], en: p[2], ar: p[3], kind: p[4], min: +p[5], max: +p[6], sz: p[7], col: p[8], nEn: p[9], nAr: p[10], extra: p[11], brand: p[12] };
    cats.push({ id: d.id, parent: d.parent, en: d.en, ar: d.ar, order: order++, visible: true });
    return d;
  });

  var MODS = [['Classic', 'كلاسيك'], ['Essential', 'أساسي'], ['Signature', 'سيجنتشر'], ['Urban', 'أوربان'], ['Premium', 'بريميوم'], ['Modern', 'مودرن'], ['Heritage', 'هيريتيج'], ['Studio', 'ستوديو']];
  var MAT = {
    tee: [['100% combed cotton', '١٠٠٪ قطن مسرّح'], ['Cotton jersey, 180 gsm', 'قطن جيرسيه ١٨٠ جرام']], shirt: [['Cotton poplin', 'قطن بوبلين'], ['Linen blend', 'خليط كتان']],
    hoodie: [['Brushed fleece cotton', 'قطن فليس مبطّن']], sweat: [['Cotton terry', 'قطن تيري']], jacket: [['Water-repellent twill', 'قماش تويل طارد للماء'], ['Wool blend', 'خليط صوف']],
    jeans: [['Stretch denim, 98% cotton', 'جينز ستريتش ٩٨٪ قطن']], trousers: [['Cotton twill with stretch', 'تويل قطن ستريتش']], shorts: [['Cotton chino', 'قطن شينو']],
    boxer: [['Cotton elastane', 'قطن مع إيلاستين']], dress: [['Viscose crepe', 'كريب فيسكوز'], ['Satin finish', 'ساتان']], top: [['Ribbed cotton', 'قطن ريب']],
    blouse: [['Light viscose', 'فيسكوز خفيف']], skirt: [['Pleated crepe', 'كريب مكسّر']], leggings: [['Quick-dry stretch fabric', 'قماش ستريتش سريع الجفاف']],
    sneaker: [['Leather upper, rubber sole', 'خارجي جلد ونعل مطاط']], heel: [['Leather upper, leather lining', 'جلد طبيعي وبطانة جلد']], loafer: [['Genuine leather', 'جلد طبيعي']],
    runner: [['Breathable mesh, EVA sole', 'شبك يسمح بالتهوية ونعل EVA']], handbag: [['Vegan leather', 'جلد صناعي']], backpack: [['Water-resistant nylon', 'نايلون مقاوم للماء']],
    shoulder: [['Grained vegan leather', 'جلد صناعي محبب']], watch: [['Stainless steel case, leather strap', 'علبة ستانلس وسير جلد']], glasses: [['Acetate frame, UV400 lenses', 'إطار أسيتات وعدسات UV400']],
    belt: [['Full grain leather', 'جلد طبيعي كامل']], wallet: [['Saffiano leather', 'جلد سافيانو']], necklace: [['Gold-plated brass', 'نحاس مطلي بالذهب']], onesie: [['Organic cotton', 'قطن عضوي']], cap: [['Cotton twill', 'قماش تويل قطن']]
  };
  var CARE = {
    cloth: ['Machine wash cold, do not bleach, iron on low.', 'غسيل بالغسالة بماء بارد، بدون كلور، كي على حرارة منخفضة.'],
    shoe: ['Wipe with a damp cloth. Keep away from direct heat.', 'امسح بقطعة قماش مبللة. ابعده عن الحرارة المباشرة.'],
    acc: ['Wipe clean with a soft dry cloth. Store in the dust bag.', 'نظّفه بقطعة ناعمة جافة وخزّنه في الكيس المرفق.']
  };
  var ORIGIN = [['Egypt', 'مصر'], ['Turkey', 'تركيا'], ['Portugal', 'البرتغال']];
  var SHOEK = { sneaker: 1, heel: 1, loafer: 1, runner: 1 }, ACCK = { handbag: 1, backpack: 1, shoulder: 1, watch: 1, glasses: 1, belt: 1, wallet: 1, necklace: 1, cap: 1 };
  var REV = [
    ['Great quality, exactly as pictured.', 'جودة ممتازة وزي الصور بالظبط.'], ['Fits true to size and feels premium.', 'المقاس مظبوط والخامة تحس إنها فاخرة.'],
    ['Good value for the price. Fast delivery.', 'سعره مناسب للجودة والتوصيل كان سريع.'], ['The color is lovely. I will order again.', 'اللون جميل وهطلب تاني.'],
    ['A bit smaller than expected, size up.', 'أصغر شوية من المتوقع، خد مقاس أكبر.'], ['Soft fabric and nice stitching.', 'القماش ناعم والخياطة نضيفة.']
  ];
  var RNAMES = [['Mona S.', 'منى س.'], ['Karim A.', 'كريم أ.'], ['Nour H.', 'نور ه.'], ['Omar F.', 'عمر ف.'], ['Salma R.', 'سلمى ر.'], ['Youssef M.', 'يوسف م.']];

  var products = [], reviews = [], pid = 1, rid = 1;
  leafDefs.forEach(function (d, li) {
    for (var k = 0; k < 4; k++) {
      var mod = MODS[(li * 3 + k * 2) % MODS.length];
      var cpool = d.col === 'DENIM' ? DENIM : d.col === 'KIDC' ? KIDC : d.col === 'LEATH' ? LEATH : CLOTH;
      var nc = ri(2, 4), cs = [], tries = 0;
      while (cs.length < nc && tries++ < 30) { var c = pick(cpool); if (cs.indexOf(c) < 0) cs.push(c); }
      var sizes = SZ[d.sz];
      var stock = {};
      cs.forEach(function (c) { sizes.forEach(function (s) { var r = R(); stock[c + '|' + s] = r < .12 ? 0 : r < .3 ? ri(1, 3) : ri(4, 16); }); });
      stock[cs[0] + '|' + sizes[Math.floor(sizes.length / 2)]] = ri(5, 14);
      var price = Math.round(ri(d.min, d.max) / 10) * 10;
      var sale = R() < .42, pct = pick([10, 15, 20, 25, 30, 40]);
      var old = sale ? Math.round(price / (1 - pct / 100) / 10) * 10 : null;
      if (sale) pct = Math.round((1 - price / old) * 100);
      var mat = pick(MAT[d.kind]), ori = pick(ORIGIN);
      var careK = SHOEK[d.kind] ? 'shoe' : ACCK[d.kind] ? 'acc' : 'cloth';
      var p = {
        id: pid++, sku: 'OSC-' + d.id.split('-')[0].toUpperCase().slice(0, 3) + '-' + (1000 + pid * 7), cat: d.id,
        cats: [d.id, d.parent].concat(d.extra === 'sport' ? ['sport'] : d.extra === 'shoes' ? ['shoes'] : d.extra === 'bags' ? ['bags'] : d.extra === 'acc' ? ['acc'] : []),
        brand: d.brand, kind: d.kind, en: mod[0] + ' ' + d.nEn, ar: d.nAr + ' ' + mod[1], price: price, old: old, pct: sale ? pct : 0,
        colors: cs, sizes: sizes, stock: stock, mat: mat, care: CARE[careK], origin: ori, demo: true, active: true,
        isNew: R() < .28, isBest: false, isFeat: R() < .25, isTrend: R() < .22, isRec: R() < .25, views: ri(50, 4000), sales: ri(0, 900), age: ri(1, 120),
        sguide: SHOEK[d.kind] ? 'shoe' : (d.kind === 'jeans' || d.kind === 'trousers' || d.kind === 'shorts' || d.kind === 'skirt' || d.kind === 'leggings') ? 'bottom' : ACCK[d.kind] ? '' : 'top'
      };
      p.descEn = 'A ' + mod[0].toLowerCase() + ' ' + d.nEn.toLowerCase() + ' from the OSCAR collection. Clean lines, a refined fit and a premium finish for everyday wear.';
      p.descAr = d.nAr + ' ' + mod[1] + ' من مجموعة أوسكار. خطوط نظيفة وقصّة مريحة وتشطيب فاخر للاستخدام اليومي.';
      products.push(p);
      var n = ri(0, 3), used = {};
      for (var j = 0; j < n; j++) { var q = ri(0, REV.length - 1); if (used[q]) continue; used[q] = 1; var nm = pick(RNAMES); reviews.push({ id: rid++, pid: p.id, userName: nm, st: ri(3, 5), en: REV[q][0], ar: REV[q][1], t: Date.now() - ri(2, 90) * 864e5, verified: true, seed: true }); }
    }
  });
  products.forEach(function (p) {
    var rs = reviews.filter(function (r) { return r.pid === p.id; });
    p.rcount = rs.length;
    p.rating = rs.length ? +(rs.reduce(function (a, r) { return a + r.st; }, 0) / rs.length).toFixed(1) : +(3.8 + R() * 1.0).toFixed(1);
  });
  products.slice().sort(function (a, b) { return b.sales - a.sales; }).slice(0, 16).forEach(function (p) { p.isBest = true; });

  var GOV = [
    ['Cairo', 'القاهرة', 1], ['Giza', 'الجيزة', 1], ['Alexandria', 'الإسكندرية', 1], ['Qalyubia', 'القليوبية', 2], ['Sharqia', 'الشرقية', 2], ['Dakahlia', 'الدقهلية', 2],
    ['Gharbia', 'الغربية', 2], ['Monufia', 'المنوفية', 2], ['Beheira', 'البحيرة', 2], ['Kafr El Sheikh', 'كفر الشيخ', 2], ['Damietta', 'دمياط', 2], ['Port Said', 'بورسعيد', 2],
    ['Ismailia', 'الإسماعيلية', 2], ['Suez', 'السويس', 2], ['Fayoum', 'الفيوم', 3], ['Beni Suef', 'بني سويف', 3], ['Minya', 'المنيا', 3], ['Asyut', 'أسيوط', 3],
    ['Sohag', 'سوهاج', 3], ['Qena', 'قنا', 3], ['Luxor', 'الأقصر', 3], ['Aswan', 'أسوان', 3], ['Red Sea', 'البحر الأحمر', 4], ['New Valley', 'الوادي الجديد', 4],
    ['Matrouh', 'مطروح', 4], ['North Sinai', 'شمال سيناء', 4], ['South Sinai', 'جنوب سيناء', 4]
  ];
  var ZONES = { 1: { std: 50, days: '2-3' }, 2: { std: 65, days: '3-4' }, 3: { std: 80, days: '4-6' }, 4: { std: 100, days: '5-8' } };
  var COUPONS = [
    { code: 'WELCOME10', type: 'pct', val: 10, firstOrder: true, min: 0, perUser: 1, max: 1000, en: '10% off your first order', ar: 'خصم ١٠٪ على أول طلب' },
    { code: 'OSCAR20', type: 'pct', val: 20, min: 1500, perUser: 3, max: 1000, en: '20% off orders above 1500 EGP', ar: 'خصم ٢٠٪ للطلبات فوق ١٥٠٠ جنيه' },
    { code: 'SAVE200', type: 'fixed', val: 200, min: 1000, perUser: 2, max: 1000, en: '200 EGP off orders above 1000 EGP', ar: 'خصم ٢٠٠ جنيه للطلبات فوق ١٠٠٠ جنيه' },
    { code: 'MEN15', type: 'pct', val: 15, cat: 'men', min: 0, perUser: 5, max: 1000, en: '15% off Men items', ar: 'خصم ١٥٪ على منتجات الرجالي' },
    { code: 'KIDS25', type: 'pct', val: 25, cat: 'kids', min: 0, perUser: 5, max: 1000, en: '25% off Kids items', ar: 'خصم ٢٥٪ على منتجات الأطفال' },
    { code: 'EXPIRED5', type: 'pct', val: 5, min: 0, perUser: 1, max: 10, end: '2026-01-01', en: 'Expired coupon (for testing)', ar: 'كوبون منتهي (للتجربة)' }
  ];
  var BANNERS = [
    { id: 1, en: 'New Collection', ar: 'كوليكشن جديد', sub_en: 'Winter essentials, redefined', sub_ar: 'أساسيات الشتاء بشكل جديد', bg: ['#1c1c1c', '#3a3226'], kind: 'jacket', color: 'camel', go: '#/list?cat=new' },
    { id: 2, en: 'Summer Collection', ar: 'كوليكشن الصيف', sub_en: 'Light fabrics, clean cuts', sub_ar: 'خامات خفيفة وقصّات أنيقة', bg: ['#d8c3a5', '#efe4d0'], kind: 'dress', color: 'white', go: '#/list?cat=women', dark: 1 },
    { id: 3, en: 'Special Offers', ar: 'عروض خاصة', sub_en: 'Up to 40% off selected pieces', sub_ar: 'خصم حتى ٤٠٪ على قطع مختارة', bg: ['#6d2332', '#3b1420'], kind: 'hoodie', color: 'beige', go: '#/list?cat=offers' },
    { id: 4, en: 'Sale Campaign', ar: 'حملة التخفيضات', sub_en: 'Use code OSCAR20', sub_ar: 'استخدم كود OSCAR20', bg: ['#2b2b2b', '#111111'], kind: 'sneaker', color: 'white', go: '#/list?cat=shoes' },
    { id: 5, en: 'Kids Corner', ar: 'ركن الأطفال', sub_en: 'Soft, playful, durable', sub_ar: 'ناعم ومريح ومتين', bg: ['#9cc5e0', '#e8f1f7'], kind: 'tee', color: 'red', go: '#/list?cat=kids', dark: 1 }
  ];
  OSC = { cats: cats, products: products, reviews: reviews, COLORS: COLORS, GOV: GOV, ZONES: ZONES, COUPONS: COUPONS, BANNERS: BANNERS,
    SGUIDE: {
      top: { h: ['Size', 'Chest (cm)', 'Length (cm)'], r: [['XS', '86-90', '66'], ['S', '90-96', '68'], ['M', '96-102', '70'], ['L', '102-108', '72'], ['XL', '108-114', '74'], ['XXL', '114-120', '76']] },
      bottom: { h: ['Size', 'Waist (cm)', 'Hip (cm)'], r: [['XS / 26', '64-68', '88-92'], ['S / 28-30', '70-76', '94-98'], ['M / 32', '78-84', '100-104'], ['L / 34', '86-92', '106-110'], ['XL / 36-38', '94-102', '112-118']] },
      shoe: { h: ['EU', 'Foot length (cm)'], r: [['36', '23.0'], ['38', '24.0'], ['40', '25.5'], ['42', '26.5'], ['44', '28.0'], ['45', '28.5']] }
    } };
})();
