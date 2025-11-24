// checkout-firebase.js  (ES module)
import { db, collection, addDoc } from "./firebase.js";

/**
 * Save order into Firestore "orders" collection.
 * Exposed as window.saveOrderToFirebase so checkout.js (non-module) can call it.
 */
window.saveOrderToFirebase = async function saveOrderToFirebase(orderData) {
  // You can change collection name if you want
  const colRef = collection(db, "orders");

  const docRef = await addDoc(colRef, {
    ...orderData,
    createdAt: new Date().toISOString(),
  });

  return docRef.id; // orderId
};
