// checkout-firebase.js
import { db, collection, addDoc } from "./js/firebase.js";

window.saveOrderToFirebase = async function saveOrderToFirebase(orderData) {
  console.log("Saving order to Firestore...", orderData); // debug

  const colRef = collection(db, "orders");
  const docRef = await addDoc(colRef, {
    ...orderData,
    createdAt: new Date().toISOString(),
  });

  console.log("Order saved with id:", docRef.id); // debug
  return docRef.id;
};
