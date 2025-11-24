// checkout.js – uses getCartDetails() from cart.js for all prices

function getCurrentUserSafe() {
  try {
    const raw = localStorage.getItem("gwUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse gwUser from localStorage", e);
    return null;
  }
}

// Use ONLY cart.js data
function getCartSummaryFromCartJs() {
  if (typeof window.getCartDetails !== "function") {
    console.warn("getCartDetails not found (cart.js not loaded?)");
    return {
      cartItems: [],
      itemsCount: 0,
      mrpTotal: 0,
      priceTotal: 0,
      discount: 0,
    };
  }

  // cart.js should return: { cart, itemsCount, mrpTotal, priceTotal, discount }
  const details = window.getCartDetails() || {};
  const rawCart = Array.isArray(details.cart) ? details.cart : [];

  const cartItems = rawCart.map((item) => {
    // We TRUST cart.js to give us correct name, price, mrp, qty
    const productId = item.productId ?? item.id ?? item.productID;
    const name = item.name || item.title || `Item ${productId}`;
    const qty = item.qty ?? item.quantity ?? 1;
    const price = item.price ?? 0;       // 👈 this is what totals already use
    const mrp = item.mrp ?? price;       // fallback

    return {
      productId,
      name,
      qty,
      price,
      mrp,
      supplierId: item.supplierId || "default-supplier",
    };
  });

  return {
    cartItems,
    itemsCount: details.itemsCount ?? 0,
    mrpTotal: details.mrpTotal ?? 0,
    priceTotal: details.priceTotal ?? 0,
    discount: details.discount ?? 0,
  };
}

function renderOrderSummary() {
  const summary = getCartSummaryFromCartJs();

  const itemsContainer = document.getElementById("orderItems");
  const mrpEl = document.getElementById("summaryMrp");
  const discountEl = document.getElementById("summaryDiscount");
  const totalEl = document.getElementById("summaryTotal");
  const noteEl = document.getElementById("summaryNote");

  if (!itemsContainer || !mrpEl || !discountEl || !totalEl || !noteEl) {
    console.warn("Checkout summary elements not found");
    return;
  }

  if (!summary.cartItems.length) {
    itemsContainer.innerHTML =
      `<p>Your cart is empty. <a href="products.html">Add some eco products →</a></p>`;
    mrpEl.textContent = "0";
    discountEl.textContent = "0";
    totalEl.textContent = "0";
    noteEl.textContent = "No items in cart.";
    return;
  }

  // Render each line using item.price from cart.js
  itemsContainer.innerHTML = "";
  summary.cartItems.forEach((item) => {
    const row = document.createElement("div");
    row.className = "order-item-row";
    row.innerHTML = `
      <div>
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-meta">Qty: ${item.qty}</div>
      </div>
      <div>₹${(item.price || 0) * (item.qty || 1)}</div>
    `;
    itemsContainer.appendChild(row);
  });

  mrpEl.textContent = summary.mrpTotal.toString();
  discountEl.textContent = summary.discount.toString();
  totalEl.textContent = summary.priceTotal.toString();
  noteEl.textContent =
    summary.discount > 0
      ? `You’ll save ₹${summary.discount} on this order.`
      : `Eco-friendly goodies on the way!`;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("checkout.js loaded");
  renderOrderSummary();

  // Update navbar cart badge
  if (typeof window.updateCartCount === "function") {
    window.updateCartCount();
  }

  // Prefill email if Google user exists
  const currentUser = getCurrentUserSafe();
  const emailInput = document.getElementById("email");
  if (currentUser && currentUser.email && emailInput) {
    emailInput.value = currentUser.email;
  }

  const form = document.getElementById("checkoutForm");
  const statusEl = document.getElementById("checkoutStatus");
  const buttonEl = document.getElementById("placeOrderBtn");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const summary = getCartSummaryFromCartJs();
    if (!summary.cartItems.length) {
      alert("Your cart is empty.");
      return;
    }

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const pincode = document.getElementById("pincode").value.trim();
    const paymentMethod =
      (form.querySelector("input[name='paymentMethod']:checked") || {}).value ||
      "COD";

    if (!fullName || !phone || !email || !address || !pincode) {
      alert("Please fill all the fields.");
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.textContent = "Placing order…";
    }
    if (statusEl) {
      statusEl.textContent =
        "Demo submit only. Next step: connect Firebase orders.";
    }

    // TEMP: just clear cart; next step we’ll save to Firestore + send emails
    if (typeof window.clearCart === "function") {
      window.clearCart();
    }

    alert("Order placed (demo). Next we connect Firebase + EmailJS.");
    window.location.href = "index.html";
  });
});
