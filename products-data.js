// products-data.js
// Single source of truth for all products used by shop + cart.

window.PRODUCTS = [
  {
    id: "plantable-pen-kit",
    name: "Plantable Pen Kit",
    price: 20,
    mrp: 25,
    category: "Writing Instruments",
    tagLabel: "WRITING INSTRUMENTS",
    image: "images/plantable-pen-kit.jpg",   // 👈 actual file
    short: "Eco-friendly pen set with seed capsules at the end.",
    description:
      "A set of plantable pens made from recycled paper. Once the ink finishes, plant the end in soil to grow herbs or flowers.",
    badge: "Best seller",
  },
  {
    id: "eco-pencil-pack",
    name: "Eco Pencil Pack",
    price: 15,
    mrp: 20,
    category: "Writing Instruments",
    tagLabel: "WRITING INSTRUMENTS",
    image: "images/eco-pencil-pack.jpg",     // 👈 actual file
    short: "10 plantable pencils with mixed seeds.",
    description:
      "Set of 10 plantable pencils with different seed types. Perfect for students and workshops.",
    badge: "Popular",
  },

  // NEW PRODUCTS
  {
    id: "diary-cork-a5",
    name: "Hard Bound Paper Cork Diary (A5)",
    price: 249,                // selling price
    mrp: 311,                  // MRP = 249 / 0.8
    category: "Stationery",
    tagLabel: "NOTEBOOKS & JOURNALS",
    image: "images/diary.jpg", // update if you change file name
    short: "Eco-friendly cork-cover A5 diary with recycled paper.",
    description:
      "Eco-friendly A5 cork-cover diary with 90 GSM recycled paper. Hard bound, handmade, perfect for college, journaling & planning.",
    badge: "New",
    supplierId: "s1",
    features: [
      "A5 size",
      "90 GSM recycled paper",
      "Hard bound + cork cover",
      "Handmade",
      "Single-line pages",
      "Monthly planner included",
    ],
  },
  {
    id: "soy-scented-candle",
    name: "Soy Wax Aesthetic Scented Candle",
    price: 189,
    mrp: 252, // MRP = 189 / 0.75
    category: "Home & Decor",
    tagLabel: "CANDLES",
    image: "images/candle.jpg",
    short: "Minimal soy-wax scented candle for calm, cozy vibes.",
    description:
      "Natural soy-wax candle with an aesthetic minimalist design. Clean burn and soothing fragrance—perfect for decor, meditation, and gifting.",
    badge: "New",
    supplierId: "s1",
    features: [
      "Made from 100% soy wax",
      "2–4 hours burn time",
      "Lead-free cotton wick",
      "Low-smoke & non-toxic",
      "Minimal modern design",
    ],
  },
  {
    id: "bamboo-gift-box",
    name: "Natural Corporate Bamboo Gift Box (12×16)",
    price: 649,
    mrp: 865, // MRP = 649 / 0.75
    category: "Gifting",
    tagLabel: "CORPORATE GIFTS",
    image: "images/bamboo-box.jpg",
    short: "Premium reusable bamboo gift box for corporate & festive gifting.",
    description:
      "Premium eco-friendly bamboo gift box for corporate gifting, festive gifting & events. Strong, reusable and elegant.",
    badge: "New",
    supplierId: "s1",
    features: [
      "Natural bamboo finish",
      "Durable & reusable",
      "Perfect for corporate gifts",
      "Handcrafted premium finish",
      "Supports branding & logo engraving",
    ],
  },
];
