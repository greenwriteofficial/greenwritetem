/* cart.js
   - Single source of truth for cart data
   - Used on ALL pages (index, products, product, cart)
*/

const CART_KEY = "greenwrite_cart";

// ---- helpers ----
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      id: item.id,
      qty: Number(item.qty) > 0 ? Number(item.qty) : 1,
    }));
  } catch (e) {
    console.error("Error loading cart", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/** Add product to cart (used on product page etc.) */
function addToCart(productId, qty = 1) {
  const cart = loadCart();
  const existing = cart.find((item) => item.id === productId);
  const addQty = Math.max(1, Number(qty) || 1);

  if (existing) {
    existing.qty += addQty;
  } else {
    cart.push({ id: productId, qty: addQty });
  }

  saveCart(cart);
  updateCartBadge();
}

/** Change quantity on cart page */
function setCartQuantity(productId, qty) {
  const cart = loadCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  const newQty = Math.max(1, Number(qty) || 1);
  item.qty = newQty;
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

/** Remove a product from cart */
function removeFromCart(productId) {
  let cart = loadCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

/** Update the little cart count in navbar */
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  const cart = loadCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalQty;
}

// ---- CART PAGE RENDERING ----

function renderCart() {
  const itemsContainer = document.getElementById("cartItemsContainer");
  const priceValueEl = document.getElementById("summaryPrice");
  const discountEl = document.getElementById("summaryDiscount");
  const deliveryEl = document.getElementById("summaryDelivery");
  const totalEl = document.getElementById("summaryTotal");
  const saveTextEl = document.getElementById("summarySavings");
  const itemsLabelEl = document.getElementById("summaryItemsLabel");

  // If we’re not on cart.html, stop
  if (!itemsContainer || !window.PRODUCTS) return;

  const cart = loadCart();

  itemsContainer.innerHTML = "";

  if (!cart.length) {
    itemsContainer.innerHTML =
      `<div class="cart-empty">Your cart is empty. Add some GreenWrite products! 🌱</div>`;
    if (priceValueEl) priceValueEl.textContent = "₹0";
    if (discountEl) discountEl.textContent = "- ₹0";
    if (deliveryEl) deliveryEl.textContent = "Enter pincode";
    if (totalEl) totalEl.textContent = "₹0";
    if (saveTextEl) saveTextEl.textContent = "You will save ₹0 on this order";
    if (itemsLabelEl) itemsLabelEl.textContent = "Price (0 item)";
    return;
  }

  let totalMrp = 0;
  let totalPrice = 0;
  let totalQty = 0;

  cart.forEach((item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (!product) return;

    const mrp = product.mrp || product.price;
    const lineMrp = mrp * item.qty;
    const linePrice = product.price * item.qty;
    totalMrp += lineMrp;
    totalPrice += linePrice;
    totalQty += item.qty;

    // Build a safe image path
const imgPath = product.images || `images/${product.id}.jpg`;

row.innerHTML = `
  <div class="cart-item-main">
    <img src="${imgPath}" alt="${product.name}">
    <div class="cart-item-info">
      <div class="cart-item-name">${product.name}</div>
      <div class="cart-item-short">${product.short || ""}</div>
      <div class="cart-item-price">
        <span>₹${product.price}</span>
        ${mrp > product.price ? `<span class="cart-item-mrp">₹${mrp}</span>` : ""}
      </div>
      <div class="cart-item-actions">
        <button class="qty-btn" data-action="minus" data-id="${product.id}">−</button>
        <input class="qty-input" data-id="${product.id}" type="number" min="1" value="${item.qty}">
        <button class="qty-btn" data-action="plus" data-id="${product.id}">+</button>
        <button class="remove-btn" data-id="${product.id}">Remove</button>
      </div>
    </div>
  </div>
`;
    itemsContainer.appendChild(row);
  });

  const discount = totalMrp - totalPrice;

  // Delivery (simple: free above ₹500, else ₹40, only after pincode check)
  const pinInput = document.getElementById("pincodeInput");
  const pinValue = pinInput ? pinInput.value.trim() : "";
  let deliveryCharge = 0;
  let deliveryLabel = "Enter pincode";
  if (pinValue && pinValue.length === 6) {
    deliveryCharge = totalPrice >= 500 ? 0 : 40;
    deliveryLabel = deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`;
  } else {
    deliveryCharge = 0;
  }

  const grandTotal = totalPrice + deliveryCharge;

  if (itemsLabelEl) itemsLabelEl.textContent = `Price (${totalQty} item${totalQty > 1 ? "s" : ""})`;
  if (priceValueEl) priceValueEl.textContent = `₹${totalMrp}`;
  if (discountEl) discountEl.textContent = discount ? `- ₹${discount}` : "- ₹0";
  if (deliveryEl) deliveryEl.textContent = deliveryLabel;
  if (totalEl) totalEl.textContent = `₹${grandTotal}`;
  if (saveTextEl) saveTextEl.textContent =
    discount > 0 ? `You will save ₹${discount} on this order` : "Great choice!";
}

// Listener to handle + / - / remove / manual qty changes
document.addEventListener("click", function (e) {
  const target = e.target;

  if (target.matches(".qty-btn")) {
    const id = target.getAttribute("data-id");
    const action = target.getAttribute("data-action");
    const cart = loadCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    if (action === "plus") item.qty += 1;
    if (action === "minus") item.qty = Math.max(1, item.qty - 1);
    saveCart(cart);
    renderCart();
    updateCartBadge();
  }

  if (target.matches(".remove-btn")) {
    const id = target.getAttribute("data-id");
    removeFromCart(id);
  }
});

// Manual quantity input
document.addEventListener("change", function (e) {
  if (e.target.matches(".cart-item-row .qty-input")) {
    const id = e.target.getAttribute("data-id");
    setCartQuantity(id, e.target.value);
  }
});

// Re-render cart when pincode is checked
document.addEventListener("click", function (e) {
  if (e.target && e.target.id === "checkPincodeBtn") {
    renderCart();
  }
});

// Initial badge + optional cart render
document.addEventListener("DOMContentLoaded", function () {
  updateCartBadge();
  // If we're on cart page, render it
  if (document.getElementById("cartItemsContainer")) {
    renderCart();
  }
});

