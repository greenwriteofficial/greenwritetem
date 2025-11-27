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
  {
  id: "diary-cork-a5",
  name: "Hard Bound Paper Cork Diary (A5)",
  price: 249,                // selling price
  mrp: 311,                  // calculated MRP
  image: "images/diary.jpg", // change image later
  supplierId: "s1",

  description: "Eco-friendly A5 cork-cover diary with 90 GSM recycled paper. Hard bound, handmade, perfect for college, journaling & planning.",
  features: [
    "A5 Size",
    "90 GSM Recycled Paper",
    "Hard Bound + Cork Cover",
    "Handmade",
    "Single-Line Pages",
    "Monthly Planner Included"
},
{
  id: "soy-scented-candle",
  name: "Soy Wax Aesthetic Scented Candle",
  price: 189,
  mrp: 252,
  image: "images/candle.jpg",
  supplierId: "s1",

  description: "Natural soy-wax candle with aesthetic minimalist design. Clean burn, soothing fragrance—perfect for decor, meditation, and gifting.",
  features: [
    "Made from 100% Soy Wax",
    "2–4 Hours Burn Time",
    "Lead-Free Cotton Wick",
    "Low-Smoke & Non-Toxic",
    "Minimal Modern Design"
},
{
  id: "bamboo-gift-box",
  name: "Natural Corporate Bamboo Gift Box (12×16)",
  price: 649,
  mrp: 865,
  image: "images/bamboo-box.jpg",
  supplierId: "s1",

  description: "Premium eco-friendly bamboo gift box for corporate gifting, festive gifting & events. Strong, reusable and elegant.",
  features: [
    "Natural Bamboo Finish",
    "Durable & Reusable",
    "Perfect for Corporate Gifts",
    "Handcrafted Finish",
    "Supports Branding & Logo Engraving"
},
];






