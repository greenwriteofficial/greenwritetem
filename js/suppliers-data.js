// suppliers-data.js
import { db, collection, getDocs } from "./firebase.js";

export async function getAllSuppliers() {
  const suppliers = [];
  const snapshot = await getDocs(collection(db, "suppliers"));

  snapshot.forEach(doc => {
    suppliers.push({ id: doc.id, ...doc.data() });
  });

  return suppliers;
}
