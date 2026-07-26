const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const categoriesData = [
  {
    name: 'SHAMPOO',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4i3fRY5A0k5fgjECoT9HHExVycxbGK9-6VjVwoEUshHSSds9HNFBe29-1MqLx3EJc-9LUNWqI9wmss3Cz6EIlsumBuP01wVUuUJEYCpDZfRKGEgmCDPQAwkadLF84FSipO1qu6wpIXJMYASbAeNriuksp1aOCAEG6QLhz7SgrPCR3LUSbhC9KO7jrHs1Nopp6WcxTJoMG5OdDXb1CFI1mFWFx7awyWIaRqpNyE6te9tEKHiEaCMSFRXHnH7hmKxugAXCLNq0NYow'
  },
  {
    name: 'CONDITIONER',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiRZsA5uHRIpgA3W1WeEvrgUVr38IVY3wSIpDmKUhrb-7m62ETodyRayWDhw3p33Py4sy_43hBt19B7_QUc6xUwk0CQXSvdytT3npovM3I3cWdy5eFy-rtdRSSSvSE0GsHK4ZhiR9KQwbaMhiJe87-xXPhw7lfVIbBf6UhgVXSJ1Q-IIgi9_udv-310UX2YLONtLp7-2ygKgG69pXQZpesj-IYulPPQ80Hb1jQkF1WAfsesV7qIc5Gygix-8hgJm_SxiZ6c-x1Unw'
  },
  {
    name: 'HAIR OIL',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTlaiB5EHB5XJdLGbSnlaaYLG3xYvso-NMVI4QnzTW-qjg5HTj6OxY9OHsTkNQhP5eLNrtvhcJnbI56J0hZOhs32R_nBk_feGuSCuNoMoejKk2WLwrRxcBy-ghmER9yYlj9RtJecN82sDrNjz2J9KqwNa6lBIVXU4daSev5odwOWyQzptTiS7-MVRQ5IecS3v3Mx79qpTdzhCh8mWQ17S_eP5CpnhtB2yHOLBTkVzsd0KypTKuFimrl9c3J_tQGZXBmkNJPx0yy9w'
  },
  {
     name: 'TREATMENTS',
     image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2wnXgt2DTOhE-ekf5Vq9oYROFinzrZ6KWD0ZR5de_ZOun-0hXnkA_wnnEQ3L_g4cSeHEVzjo4sjfH-fVTRNkHC3SiKLezUkI5Rtct4abso6SCTwrgY6P3tiXHPqK6iKBhUqdjoCDHWYRE94YmM2W2GQHdBTAI6KUwwSeXMTC47Jiiohgp3dVSmdmsQ-tSU9KqFodo8d_OmaufnV5coUnrdUEcpWIETitGWDoCeYJmB8agab-rWlGfnC4hRI_GzQi9GfB9MhuETVg'
  }
];

const productsData = [
  {
    name: 'REVITALIZING CLEANSE',
    category: 'shampoo',
    subCategory: 'Botanical Complex & Amino Acids',
    price: 42.00,
    primaryImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
    description: 'A botanical-infused deep-cleansing shampoo designed to strip away impurities and environmental residue without drying your scalp. Fortified with silk amino acids to rebuild hair protein, adding weightless body and high-gloss bounce.',
    sizes: ['250ML', '500ML'],
    isBestSeller: true,
    benefits: [
      'Deeply purifies the scalp of product buildup and pollution',
      'Infuses essential amino acids to rebuild damaged hair fibers',
      'pH balanced formulation prevents frizz and moisture loss',
      'Safe for daily use on all hair types, including color-treated hair'
    ],
    ingredients: 'Aqua (Water/Eau), Sodium Lauroyl Methyl Isethionate, Cocamidopropyl Betaine, Silk Amino Acids, Aloe Barbadensis Leaf Juice, Camellia Sinensis (Green Tea) Leaf Extract, Panax Ginseng Root Extract, Glycerin, Panthenol, Citric Acid, Salicylic Acid, Phenoxyethanol, Parfum.',
    rating: 4.8,
    numReviews: 142,
    hairTypes: ['straight', 'wavy', 'curly', 'coil'],
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608248593842-8d77d701df93?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'MOISTURE SURGE',
    category: 'shampoo',
    subCategory: 'Hyaluronic Acid & Silk Protein',
    price: 48.00,
    primaryImage: 'https://images.unsplash.com/photo-1608248593842-8d77d701df93?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1608248593842-8d77d701df93?q=80&w=400&auto=format&fit=crop',
    description: 'An ultra-hydrating cleanser designed for dry, thirsty hair. Packed with triple-weight hyaluronic acid to pull in moisture and silk protein to lock it down, delivering immediate suppleness and mirror-like shine.',
    sizes: ['250ML', '500ML'],
    benefits: [
      'Draws intensive moisture into the hair core with hyaluronic acid',
      'Smooths the cuticle to reduce water loss and lock in shine',
      'Provides exceptional detangling and slip during washing',
      'Improves hair elasticity and reduces breakages'
    ],
    ingredients: 'Aqua (Water/Eau), Sodium Cocoyl Isethionate, Cocamidopropyl Hydroxysultaine, Sodium Hyaluronate, Hydrolyzed Silk, Argania Spinosa Kernel Oil, Panthenol, Tocopheryl Acetate, Glycol Distearate, Phenoxyethanol, Ethylhexylglycerin, Linalool, Fragrance.',
    rating: 4.9,
    numReviews: 98,
    hairTypes: ['curly', 'coil', 'wavy', 'straight'],
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'VOLUME INFUSION',
    category: 'shampoo',
    subCategory: 'Sea Kelp & Biotin Complex',
    price: 38.00,
    primaryImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop',
    description: 'Specifically engineered for fine and limp hair, this shampoo lifts hair at the root while coating each strand with protective sea kelp minerals and high-potency biotin, generating instant density and long-lasting fullness.',
    sizes: ['250ML', '500ML'],
    benefits: [
      'Amplifies fine strands with nourishing sea kelp extract',
      'Fortified with biotin to support hair strand strength and density',
      'Provides lightweight moisture that never weighs hair down',
      'Creates a clean, full-bodied look with airy texture'
    ],
    ingredients: 'Aqua (Water/Eau), Lauryl Glucoside, Sodium Coco-Sulfate, Macrocystis Pyrifera (Sea Kelp) Extract, Biotin, Hydrolyzed Wheat Protein, Salvia Officinalis (Sage) Leaf Extract, Citric Acid, Benzyl Alcohol, Potassium Sorbate, Limonene.',
    rating: 4.7,
    numReviews: 76,
    hairTypes: ['straight', 'wavy'],
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1615397323940-06f15cde90f9?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'DETOXIFYING CLAY',
    category: 'shampoo',
    subCategory: 'Kaolin & Tea Tree Extract',
    price: 45.00,
    primaryImage: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=400&auto=format&fit=crop',
    description: 'An advanced scalp treatment shampoo formulated with mineral-rich kaolin clay to absorb excess sebum and clarifying tea tree oil to relieve itching. Restores natural scalp homeostasis and adds fresh bounce.',
    sizes: ['250ML', '500ML'],
    benefits: [
      'Gently absorbs excess oils and product residues using natural clay',
      'Tea tree oil purifies the scalp and provides a soothing cooling sensation',
      'Restores perfect oil-water balance to overactive sebaceous glands',
      'Provides a healthy, deeply refreshed scalp foundation'
    ],
    ingredients: 'Aqua (Water/Eau), Kaolin Clay, Sodium Lauroyl Methyl Isethionate, Cocamidopropyl Betaine, Melaleuca Alternifolia (Tea Tree) Leaf Oil, Mentha Piperita (Peppermint) Oil, Charcoal Powder, Glycerin, Sodium Benzoate, Citric Acid.',
    rating: 4.6,
    numReviews: 88,
    hairTypes: ['straight', 'wavy', 'curly', 'coil'],
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571781926291-c477eb31f74e?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'SILK REPAIR',
    category: 'shampoo',
    subCategory: 'Ceramides & Keratin',
    price: 52.00,
    primaryImage: 'https://images.unsplash.com/photo-1615397323940-06f15cde90f9?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1615397323940-06f15cde90f9?q=80&w=400&auto=format&fit=crop',
    description: 'An elite reparative cleanser formulated for heat-damaged, chemically-treated, or highly vulnerable hair. Rich ceramides reconstruct intercellular lipids, while hydrolyzed keratin reinforces structural bonds to stop split ends.',
    sizes: ['250ML', '500ML'],
    benefits: [
      'Reconstructs broken protein bonds and split ends with Keratin',
      'Ceramides reinforce hair fibers against future mechanical or heat damage',
      'Deeply conditions the cuticle to eliminate coarse, rough textures',
      'Provides an immediate smooth, glass-like finish'
    ],
    ingredients: 'Aqua (Water/Eau), Hydrolyzed Keratin, Ceramide NP, Ceramide AP, Sodium Lauroyl Sarcosinate, Cocamidopropyl Betaine, Shea Butter Glycerides, Glycerin, Guar Hydroxypropyltrimonium Chloride, Citric Acid, Phenoxyethanol.',
    rating: 4.9,
    numReviews: 112,
    hairTypes: ['straight', 'wavy', 'curly', 'coil'],
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'COLOR GUARD',
    category: 'shampoo',
    subCategory: 'UV Filter & Pomegranate',
    price: 44.00,
    primaryImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop',
    description: 'A dedicated shade-preserving shampoo that forms an invisible multi-shield barrier. Advanced UV filters block color-fading sun rays, while pomegranate extract delivers vital antioxidants to keep colors vibrant.',
    sizes: ['250ML', '500ML'],
    benefits: [
      'Shields colored hair from UV-induced degradation and fading',
      'Pomegranate antioxidants locks in pigment depth and dimension',
      'Infuses brilliant, multi-dimensional shine to highlights',
      'Gentle, sulfate-free formula preserves professional salon tone'
    ],
    ingredients: 'Aqua (Water/Eau), Sodium Methyl Cocoyl Taurate, Punica Granatum (Pomegranate) Fruit Extract, Ethylhexyl Methoxycinnamate (UV Filter), Helianthus Annuus (Sunflower) Seed Extract, Vitamin E, Panthenol, Glycerin, Citric Acid.',
    rating: 4.8,
    numReviews: 65,
    hairTypes: ['straight', 'wavy', 'curly', 'coil'],
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1629198725800-474be66e4a6d?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228722-dca8de919014?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'CURL DEFINE',
    category: 'shampoo',
    subCategory: 'Argan Oil & Aloe Vera',
    price: 39.00,
    primaryImage: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=400&auto=format&fit=crop',
    description: 'A sulfate-free, high-moisture formula crafted specifically for waves, curls, and coils. Cold-pressed argan oil delivers deep lipids to the hair fiber, while aloe vera juice controls frizz, creating springy, defined curl patterns.',
    sizes: ['250ML', '500ML'],
    benefits: [
      'Controls frizz and flyaways in high humidity',
      'Provides intense elastic hydration to keep curls bouncy',
      'Sulfate-free formulation prevents drying out natural curls',
      'Smooths and defines curl grouping for structured waves'
    ],
    ingredients: 'Aqua (Water/Eau), Aloe Barbadensis Leaf Juice, Argania Spinosa (Argan) Kernel Oil, Cocamidopropyl Betaine, Sodium Lauroyl Methyl Isethionate, Polyquaternium-10, Glycerin, Hydrolyzed Rice Protein, Potassium Sorbate.',
    rating: 4.7,
    numReviews: 93,
    hairTypes: ['curly', 'coil', 'wavy'],
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'SILKY GLOW SHAMPOO',
    category: 'shampoo',
    subCategory: 'Argan Oil & Keratin Formula',
    price: 28.00,
    primaryImage: 'https://images.unsplash.com/photo-1571781926291-c477eb31f74e?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1571781926291-c477eb31f74e?q=80&w=400&auto=format&fit=crop',
    description: 'A restorative cleanser designed to infuse hair with deep hydration and mirror-like shine. Our clinical-grade formula smooths the cuticle and protects against environmental stressors, leaving hair weightless and brilliantly Strandds.',
    sizes: ['250ML', '500ML'],
    isBestSeller: true,
    benefits: [
      'Sulfate-free and paraben-free formula',
      'Enhances light reflection for visible shine',
      'Safe for color-treated and keratin-treated hair',
      'Infused with cold-pressed marula oil and organic argan kernel oil'
    ],
    ingredients: 'Aqua (Water/Eau), Sodium Lauroyl Methyl Isethionate, Cocamidopropyl Betaine, Sclerocarya Birrea Seed Oil (Marula), Argania Spinosa Kernel Oil, Glycerin, Fragrance/Parfum, Sodium Chloride, Panthenol, Citric Acid, Phenoxyethanol.',
    rating: 4.9,
    numReviews: 231,
    hairTypes: ['straight', 'wavy', 'curly', 'coil'],
    stock: 80,
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477eb31f74e?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608248593842-8d77d701df93?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'GLOW CONDITIONER',
    category: 'conditioner',
    subCategory: 'Silk Protein & Jojoba',
    price: 32.00,
    primaryImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=400&auto=format&fit=crop',
    description: 'A luxurious post-shampoo conditioner formulated with hydrolyzed silk proteins and vitamin-rich jojoba oil. Restores deep moisture, seals cuticles, and provides phenomenal silkiness without weighing down fine hair.',
    sizes: ['250ML', '500ML'],
    benefits: [
      'Instantly smooths cuticle scales to maximize gloss and detangling',
      'Jojoba oil seals hair fiber with non-comedogenic lipid barrier',
      'Dramatically reduces blow-dry and styling friction damages',
      'Provides weightless flow and high fluid movement'
    ],
    ingredients: 'Aqua (Water/Eau), Cetearyl Alcohol, Simmondsia Chinensis (Jojoba) Seed Oil, Hydrolyzed Silk, Behentrimonium Chloride, Glycerin, Panthenol, Dimethiconol, Phenoxyethanol, Citric Acid.',
    rating: 4.8,
    numReviews: 164,
    hairTypes: ['straight', 'wavy', 'curly', 'coil'],
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608248593842-8d77d701df93?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'ILLUMINATING OIL',
    category: 'hair oil',
    subCategory: 'Argan & Jojoba Blend',
    price: 45.00,
    primaryImage: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=400&auto=format&fit=crop',
    description: 'An ultra-refined, non-greasy capillary serum. Absorbs instantly into the hair cortex to restore depleted natural oils, eliminate split ends, and deliver a brilliant editorial-ready glow.',
    sizes: ['30ML'],
    benefits: [
      'Eliminates styling frizz and flyaways instantly',
      'Provides deep hair fiber lipid nourishment without heavy residues',
      'Protects locks from high-temperature flat irons up to 450°F',
      'Leaves an intoxicating premium woody-floral scent'
    ],
    ingredients: 'Cyclopentasiloxane, Dimethiconol, Argania Spinosa Kernel Oil, Simmondsia Chinensis Seed Oil, Marula Seed Oil, Fragrance/Parfum, Tocopheryl Acetate.',
    rating: 4.9,
    numReviews: 195,
    hairTypes: ['straight', 'wavy', 'curly', 'coil'],
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'REPAIR MASK',
    category: 'treatments',
    subCategory: 'Intensive Deep Conditioning',
    price: 38.00,
    primaryImage: 'https://images.unsplash.com/photo-1629198725800-474be66e4a6d?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1629198725800-474be66e4a6d?q=80&w=400&auto=format&fit=crop',
    description: 'A deep conditioning repair butter designed to heal severely dry, over-processed, or split-prone hair. Generous concentrations of shea butter and argan butter fill hair micro-cavities for spectacular texture repair.',
    sizes: ['100ML', '250ML'],
    benefits: [
      'Intensively restores dry and extremely damaged structures',
      'Provides long-term moisture buffer against styling fatigue',
      'Dramatically softens coarse, thick, and curly textures',
      'Improves hair mechanical resistance to brushing and heat'
    ],
    ingredients: 'Aqua (Water/Eau), Butyrospermum Parkii Butter, Argania Spinosa Kernel Oil, Cetearyl Alcohol, Behentrimonium Methosulfate, Glycerin, Hydrolyzed Wheat Protein, Phenoxyethanol, Lactic Acid.',
    rating: 4.9,
    numReviews: 147,
    hairTypes: ['straight', 'wavy', 'curly', 'coil'],
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1615397323940-06f15cde90f9?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'LEAVE-IN SHINE',
    category: 'treatments',
    subCategory: 'Sleek & Protect Spray',
    price: 26.00,
    primaryImage: 'https://images.unsplash.com/photo-1556228722-dca8de919014?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1556228722-dca8de919014?q=80&w=400&auto=format&fit=crop',
    description: 'An airy aerosol protectant spray that seals the styling cuticle and elevates light refraction. Provides active thermal protection and shields your hair from smog, dust, and dynamic daily pollution.',
    sizes: ['200ML'],
    benefits: [
      'Gives instant glass hair shine without feeling oily or heavy',
      'Provides active thermal defense from hot iron tools',
      'Shields hair cuticles from structural environmental dust build-up',
      'Perfect styling primer and finisher for ultra-straight looks'
    ],
    ingredients: 'Aqua (Water/Eau), Cyclopentasiloxane, Alcohol Denat., PEG-40 Hydrogenated Castor Oil, Keratin Amino Acids, Panthenol, Polyquaternium-16, Cetrimonium Chloride, Phenoxyethanol, Citric Acid.',
    rating: 4.7,
    numReviews: 86,
    hairTypes: ['straight', 'wavy'],
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571781926291-c477eb31f74e?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'LUSTRE HAIR OIL',
    category: 'hair oil',
    subCategory: 'Intensive Repair',
    price: 48.00,
    primaryImage: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=400&auto=format&fit=crop',
    description: 'An elite botanical oil that targets split ends, dryness, and mechanical damage. Cold-pressed seeds supply pure oleic and linoleic acids, protecting cuticles from friction and heat styling up to 420°F.',
    sizes: ['30ML'],
    benefits: [
      'Eliminates dry split ends and seals the cuticle layer',
      'Provides deep cortex nutrition without flattening fine hair strands',
      'Instantly smooths cuticle flyaways with premium velvet texture',
      'Can be applied on wet, damp, or dry hair as a protective seal'
    ],
    ingredients: 'Argania Spinosa Kernel Oil, Simmondsia Chinensis Seed Oil, Sclerocarya Birrea Seed Oil (Marula), Caprylic/Capric Triglyceride, Fragrance.',
    rating: 4.9,
    numReviews: 312,
    hairTypes: ['straight', 'wavy', 'curly', 'coil'],
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'HYDRATING WASH',
    category: 'shampoo',
    subCategory: 'Daily Essential',
    price: 32.00,
    primaryImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop',
    description: 'An elegant, lightweight hydrating shampoo designed for frequent washing. Mild coconut-derived surfactants cleanse gently without stripping scalp sebum, while plant extracts deliver essential nutrients.',
    sizes: ['250ML', '500ML'],
    benefits: [
      'Gently cleanses and removes product buildup without drying',
      'Replenishes natural hydration levels on daily washing cycles',
      'Calms scalp redness and itching with soothing botanical extracts',
      'Sulfate-free formulation is safe on color and extensions'
    ],
    ingredients: 'Aqua (Water/Eau), Sodium Lauroyl Methyl Isethionate, Cocamidopropyl Betaine, Glycerin, Hydrolyzed Rice Protein, Aloe Leaf Extract, Potassium Sorbate.',
    rating: 4.8,
    numReviews: 184,
    hairTypes: ['straight', 'wavy', 'curly', 'coil'],
    stock: 55,
    images: [
      'https://images.unsplash.com/photo-1629198725800-474be66e4a6d?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228722-dca8de919014?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'WEIGHTLESS RINSE',
    category: 'conditioner',
    subCategory: 'Volumizing Formula',
    price: 34.00,
    primaryImage: 'https://images.unsplash.com/photo-1571781926291-c477eb31f74e?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1571781926291-c477eb31f74e?q=80&w=400&auto=format&fit=crop',
    description: 'A daily conditioner that adds exceptional body and detangling slide without weighing down fine hair. Coats strands with a micro-thin nourishing envelope that adds airiness and bounce.',
    sizes: ['250ML', '500ML'],
    benefits: [
      'Provides intense daily detangling and hydration without heavy oils',
      'Imparts air-like density and root volume immediately',
      'Amino acids restructure fine, flat strands to improve tensile strength',
      'Provides high thermal defense during blow-dry styling'
    ],
    ingredients: 'Aqua (Water/Eau), Cetearyl Alcohol, Hydrolyzed Wheat Protein, Argan Oil, Behentrimonium Chloride, Panthenol, Citric Acid, Phenoxyethanol.',
    rating: 4.7,
    numReviews: 154,
    hairTypes: ['straight', 'wavy'],
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop'
    ]
  },
  {
    name: 'VELVET MASK',
    category: 'treatments',
    subCategory: 'Weekly Treatment',
    price: 56.00,
    primaryImage: 'https://images.unsplash.com/photo-1608248593842-8d77d701df93?q=80&w=400&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1608248593842-8d77d701df93?q=80&w=400&auto=format&fit=crop',
    description: 'An intensive, moisture-locking weekly treatment formulated with clinical lipids, raw shea butter, and keratin. Repairs internal molecular cracks in the hair fiber and smooths cuticles to restore supreme, velvety texture.',
    sizes: ['100ML', '250ML'],
    benefits: [
      'Heals cracked hair fibers and dry split ends after one application',
      'Provides massive clinical-grade hydration buffering for up to 7 days',
      'Leaves hair feeling spectacularly soft, luxurious, and easy to brush',
      'Dramatically reduces chemical-treatment split end breakages'
    ],
    ingredients: 'Aqua (Water/Eau), Shea Butter, Hydrolyzed Keratin, Argan Kernel Oil, Glycerin, Behentrimonium Methosulfate, Lactic Acid, Benzyl Alcohol, Parfum.',
    rating: 4.9,
    numReviews: 201,
    hairTypes: ['straight', 'wavy', 'curly', 'coil'],
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477eb31f74e?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608248593842-8d77d701df93?q=80&w=400&auto=format&fit=crop'
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.ATLASDB_URI);
    console.log('Connected to Atlas cluster for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();

    console.log('Cleared existing collections.');

    // Seed Categories by calling Category.create to ensure 'save' middleware runs to generate slugs
    const seededCategories = [];
    for (const cat of categoriesData) {
      const created = await Category.create(cat);
      seededCategories.push(created);
    }
    console.log(`Inserted ${seededCategories.length} categories.`);

    // Seed Products
    // Wait, the products categories are lowercase strings matching slugs in Category
    const categoryMap = {};
    seededCategories.forEach(cat => {
      categoryMap[cat.slug] = cat.name;
    });

    const productsToInsert = productsData.map(prod => {
      // Find category slug, default if not matching
      let actualCat = prod.category.toLowerCase();
      if (!categoryMap[actualCat]) {
        if (actualCat === 'hair oil') actualCat = 'hair-oil';
      }
      return {
        ...prod,
        category: actualCat
      };
    });

    const seededProducts = await Product.insertMany(productsToInsert);
    console.log(`Inserted ${seededProducts.length} products.`);

    // Seed Admin & Test User
    const adminUser = await User.create({
      name: 'Admin Strandds',
      email: 'admin@Strandds.com',
      password: 'adminuser123',
      role: 'admin',
      phone: '9876543210'
    });

    const normalUser = await User.create({
      name: 'Rishabh Customer',
      email: 'user@Strandds.com',
      password: 'normaluser123',
      role: 'user',
      phone: '1234567890'
    });

    console.log(`Seeded Admin user (${adminUser.email}) and Test Customer user (${normalUser.email})`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
