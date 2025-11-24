// checkout.js – non-module version, only uses cart.js

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

// Use data from cart.js
function getCartDetailsFromCartJs() {
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

  const { cart, itemsCount, mrpTotal, priceTotal, discount } =
    window.getCartDetails();

  // Build items using cart data directly (don’t depend on PRODUCTS)
  const detailedItems = (cart || []).map((cartItem) => ({
    productId: cartItem.productId || cartItem.id,
    name: cartItem.name || `Item ${cartItem.productId || cartItem.id}`,
    qty: cartItem.qty || 1,
    price: cartItem.price || 0,
    supplierId: cartItem.supplierId || "default-supplier",
  }));

  return {
    cartItems: detailedItems,
    itemsCount,
    mrpTotal,
    priceTotal,
    discount,
  };
}

function renderOrderSummary() {
  const summary = getCartDetailsFromCartJs();

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

  if (typeof window.updateCartCount === "function") {
    window.updateCartCount();
  }

  // Prefill email if user logged in
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

    const summary = getCartDetailsFromCartJs();
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
      (form.querySelector("input[name='paymentMethod']:checked") || {})
        .value || "COD";

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
      statusEl.textContent = "For now, this is a demo. Next step: connect Firebase orders.";
    }

    // Right now just show success & clear cart.
    // In the next step we’ll save to Firestore & email suppliers.
    if (typeof window.clearCart === "function") {
      window.clearCart();
    }

    alert("Order placed demo! Next we will connect Firebase + EmailJS.");
    window.location.href = "index.html";
  });
});
