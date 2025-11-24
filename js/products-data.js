// products-data.js
import { db, collection, getDocs } from "./firebase.js";

export async function getAllProducts() {
  const products = [];
  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });

  return products;
}
