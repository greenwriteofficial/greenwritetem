// products-data.js
// Master product list for the store.
// Every product supports:
// id, name, price, mrp, image, gallery[], description, features[], supplierId, etc.

window.PRODUCTS = [

  /* ------------------------------------------------------
     1) Plantable Pen Kit
  ------------------------------------------------------ */
  {
    id: "plantable-pen-kit",
    name: "Plantable Pen Kit",
    price: 20,
    mrp: 25,
    category: "Writing Instruments",
    tagLabel: "WRITING INSTRUMENTS",

    image: "images/plantable-pen-kit.jpg",

    gallery: [
      "images/plantable-pen-kit.jpg"
    ],

    short: "Eco-friendly pen set with seed capsules at the end.",
    description:
      "A set of plantable pens made from recycled paper. Once the ink finishes, plant the end in soil to grow herbs or flowers.",

    badge: "Best seller",
    supplierId: "s1"
  },

  /* ------------------------------------------------------
     2) Eco Pencil Pack
  ------------------------------------------------------ */
  {
    id: "eco-pencil-pack",
    name: "Eco Pencil Pack",
    price: 15,
    mrp: 20,
    category: "Writing Instruments",
    tagLabel: "WRITING INSTRUMENTS",

    image: "images/eco-pencil-pack.jpg",

    gallery: [
      "images/eco-pencil-pack.jpg"
    ],

    short: "10 plantable pencils with mixed seeds.",
    description:
      "Set of 10 plantable pencils with different seed types. Perfect for students and eco-friendly workshops.",

    badge: "Popular",
    supplierId: "s1"
  },

  /* ------------------------------------------------------
     3) Hard Bound Cork Diary (A5)
  ------------------------------------------------------ */
  {
    id: "diary-cork-a5",
    name: "Hard Bound Paper Cork Diary (A5)",
    price: 249,
    mrp: 311,  // calculated (249 / 0.8)

    category: "Stationery",
    tagLabel: "JOURNALS & DIARIES",

    // DEFAULT thumbnail image
    image: "images/diary.jpg",

    // FULL GALLERY
    gallery: [
      "images/diary.jpg",
      "images/diary-cork-a5-1.webp"
    ],

    supplierId: "s1",

    short: "A5 cork-cover hardbound diary with recycled paper and monthly planner.",
    description:
      "Eco-friendly A5 cork-cover diary made with 90 GSM recycled paper. Hard bound, handmade and perfect for college notes, journaling and planning.",

    features: [
      "A5 size",
      "90 GSM recycled paper",
      "Hard bound + cork cover",
      "Handmade",
      "Single-line pages",
      "Monthly planner included"
    ],

    badge: "New"
  },

  /* ------------------------------------------------------
     4) Soy Wax Aesthetic Scented Candle
        — FULL gallery added
  ------------------------------------------------------ */
  {
    id: "soy-scented-candle",
    name: "Soy Wax Aesthetic Scented Candle",
    price: 189,
    mrp: 252, // calculated (189 / 0.75)

    category: "Home & Decor",
    tagLabel: "CANDLES & FRAGRANCE",

    image: "images/soy-scented-candle-0.webp",

    gallery: [
      "images/soy-scented-candle-0.webp",
      "images/soy-scented-candle-1.webp",
      "images/soy-scented-candle-2.webp",
      "images/soy-scented-candle-3.webp"
    ],

    supplierId: "s1",

    short: "Minimal soy-wax candle with calming fragrance and clean burn.",
    description:
      "Natural soy-wax candle with a modern aesthetic design. Clean, low-smoke burn and a soothing fragrance—perfect for relaxation, meditation or cozy decor.",

    features: [
      "100% soy wax",
      "2–4 hours burn time",
      "Lead-free cotton wick",
      "Low-smoke & non-toxic",
      "Minimal modern design"
    ],

    badge: "New"
  },

  /* ------------------------------------------------------
     5) Bamboo Corporate Gift Box
  ------------------------------------------------------ */
  {
    id: "bamboo-gift-box",
    name: "Natural Corporate Bamboo Gift Box (12×16)",
    price: 649,
    mrp: 865, // calculated (649 / 0.75)

    category: "Gifting",
    tagLabel: "CORPORATE GIFTS",

    image: "images/bamboo-box.jpg",

    gallery: [
      "images/bamboo-box.jpg"
    ],

    supplierId: "s1",

    short: "Premium reusable bamboo gift box for corporate and festive gifting.",
    description:
      "Eco-friendly and stylish bamboo gift box with a natural finish and premium craftsmanship. Ideal for corporate gifting, festive hampers and special occasions.",

    features: [
      "Natural bamboo finish",
      "Strong, durable and reusable",
      "Perfect for corporate gifts and hampers",
      "Handcrafted premium look",
      "Supports branding or logo engraving"
    ],

    badge: "New"
  }

  // ------------------------------------------------------
  // Add more products below by copying one of the blocks.
  // ------------------------------------------------------
];


