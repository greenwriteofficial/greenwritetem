// products-data.js
// Keep ALL product information in this single source of truth.

window.PRODUCTS = [
  {
    id: "plantable-pen-kit",
    name: "Plantable Pen Kit",
    price: 20,
    mrp: 25,
    category: "Writing Instruments",
    tagLabel: "WRITING INSTRUMENTS",
    image: "images/plantable-pen-kit.jpg", // <- IMPORTANT: single `image` key
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
    image: "images/eco-pencil-pack.jpg", // <- IMPORTANT
    short: "10 plantable pencils with mixed seeds.",
    description:
      "Set of 10 plantable pencils with different seed types. Perfect for students and workshops.",
    badge: "Popular",
  },
];
