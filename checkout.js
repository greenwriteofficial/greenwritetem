// checkout.js (ES module)
import { db, collection, addDoc } from "./firebase.js";
// Later we can also import suppliers & Razorpay helpers here

// Reuse same structure as cart.js
function getCurrentUserSafe() {
  try {
    const raw = localStorage.getItem("gwUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Helper to read cart & product data
function getCartDetailsFromCartJs() {
  // getCartDetails and findProductById are defined in cart.js (global)
  if (typeof getCartDetails !== "function") return null;

  const { cart, itemsCount, mrpTotal, priceTotal, discount } = getCartDetails();

  // Build expanded items with product details + supplierId
  const detailedItems = (cart || []).map((cartItem) => {
    const product = window.PRODUCTS.find(
      (p) => String(p.id) === String(cartItem.productId)
    );
    if (!product) return null;

    return {
      productId: cartItem.productId,
      name: product.name,
      qty: cartItem.qty || 1,
      price: product.price || 0,
      mrp: product.mrp || product.price || 0,
      // For now, single supplier. Later: set real supplierId per product.
      supplierId: product.supplierId || "default-supplier",
    };
  }).filter(Boolean);

  return {
    cartItems: detailedItems,
    itemsCount,
    mrpTotal,
    priceTotal,
    discount,
  };
}

// Render order summary on the right
function renderOrderSummary() {
  const summary = getCartDetailsFromCartJs();
  const itemsContainer = document.getElementById("orderItems");
  const mrpEl = document.getElementById("summaryMrp");
  const discountEl = document.getElementById("summaryDiscount");
  const totalEl = document.getElementById("summaryTotal");
  const noteEl = document.getElementById("summaryNote");

  if (!summary || !summary.cartItems.length) {
    if (itemsContainer) {
      itemsContainer.innerHTML =
        `<p>Your cart is empty. <a href="products.html">Add some eco products →</a></p>`;
    }
    if (mrpEl) mrpEl.textContent = "0";
    if (discountEl) discountEl.textContent = "0";
    if (totalEl) totalEl.textContent = "0";
    if (noteEl) noteEl.textContent = "No items in cart.";
    return;
  }

  itemsContainer.innerHTML = "";
  summary.cartItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "order-item-row";
    row.innerHTML = `
      <div>
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-meta">Qty: ${item.qty}</div>
      </div>
      <div>₹${item.price * item.qty}</div>
    `;
    itemsContainer.appendChild(row);
  });

  if (mrpEl) mrpEl.textContent = summary.mrpTotal.toString();
  if (discountEl) discountEl.textContent = summary.discount.toString();
  if (totalEl) totalEl.textContent = summary.priceTotal.toString();
  if (noteEl) {
    noteEl.textContent =
      summary.discount > 0
        ? `You’ll save ₹${summary.discount} on this order.`
        : `Eco-friendly goodies on the way!`;
  }
}

// Split items per supplier for emails / future logic
function splitBySupplier(items) {
  const bySupplier = {};
  items.forEach((item) => {
    const sid = item.supplierId || "default-supplier";
    if (!bySupplier[sid]) {
      bySupplier[sid] = { items: [], total: 0 };
    }
    bySupplier[sid].items.push(item);
    bySupplier[sid].total += (item.price || 0) * (item.qty || 1);
  });
  return bySupplier;
}

// Placeholder: later we’ll plug EmailJS here
async function sendSupplierEmails(orderId, orderData) {
  console.log("TODO: send emails per supplier for order:", orderId, orderData);
  // Here we will later call EmailJS:
  // emailjs.send("service_id","template_id",{...});
}

// MAIN: handle checkout form submit
document.addEventListener("DOMContentLoaded", () => {
  // Show cart summary
  renderOrderSummary();

  // Keep navbar cart badge working
  if (typeof updateCartCount === "function") {
    updateCartCount();
  }

  // Prefill email from logged-in user if available
  const currentUser = getCurrentUserSafe();
  const emailInput = document.getElementById("email");
  if (currentUser && currentUser.email && emailInput) {
    emailInput.value = currentUser.email;
  }

  const form = document.getElementById("checkoutForm");
  const statusEl = document.getElementById("checkoutStatus");
  const buttonEl = document.getElementById("placeOrderBtn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const summary = getCartDetailsFromCartJs();
    if (!summary || !summary.cartItems.length) {
      alert("Your cart is empty.");
      return;
    }

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const paymentMethod = (
      form.querySelector("input[name='paymentMethod']:checked") || {}
    ).value || "COD";

    if (!fullName || !phone || !email || !address || !pincode) {
      alert("Please fill all the fields.");
      return;
    }

    // For now: simple validation for Indian pincode
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    // COD vs PREPAID (for now we treat PREPAID same as COD;
    // later we will call Razorpay before saving)
    const paymentStatus = paymentMethod === "PREPAID" ? "paid" : "pending";

    // Build order object
    const supplierSplit = splitBySupplier(summary.cartItems);

    const orderData = {
      createdAt: new Date().toISOString(),
      paymentMethod,
      paymentStatus,
      totals: {
        mrpTotal: summary.mrpTotal,
        priceTotal: summary.priceTotal,
        discount: summary.discount,
        itemsCount: summary.itemsCount,
      },
      customer: {
        fullName,
        phone,
        email,
        address,
        pincode,
      },
      user: currentUser || null, // Google user info if logged in
      items: summary.cartItems,
      suppliers: supplierSplit,
    };

    try {
      if (buttonEl) {
        buttonEl.disabled = true;
        buttonEl.textContent = "Placing order…";
      }
      if (statusEl) {
        statusEl.textContent = "Saving your order securely…";
      }

      const ref = await addDoc(collection(db, "orders"), orderData);
      const orderId = ref.id;

      if (statusEl) {
        statusEl.textContent = `Order placed! ID: ${orderId}`;
      }

      // TODO: send emails per supplier
      await sendSupplierEmails(orderId, orderData);

      // Clear cart using function from cart.js
      if (typeof clearCart === "function") {
        clearCart();
      }

      alert("Your order has been placed! We'll contact you shortly.");
      window.location.href = "index.html";
    } catch (err) {
      console.error("Error saving order:", err);
      if (statusEl) {
        statusEl.textContent = "Error placing order. Please try again.";
      }
      alert("Something went wrong while placing your order.");
    } finally {
      if (buttonEl) {
        buttonEl.disabled = false;
        buttonEl.textContent = "Place Order";
      }
    }
  });
});
