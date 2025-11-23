/* cart.js
   Shared cart logic for all pages
   - Uses localStorage key "greenwrite_cart"
   - Renders cart.html
*/

const CART_KEY = "greenwrite_cart";
let CART_TOTALS = {
  totalMrp: 0,
  totalPrice: 0,
  discount: 0,
  deliveryCharge: 0,
  grandTotal: 0,
  totalQty: 0,
};

// ---------- basic helpers ----------

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

/** Add product from product.html */
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

/** Update quantity from cart page */
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

/** Remove item from cart */
function removeFromCart(productId) {
  let cart = loadCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

/** Update little count bubble in navbar */
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  const cart = loadCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalQty;
}

// ---------- cart page rendering ----------

function renderCart() {
  const itemsContainer = document.getElementById("cartItemsContainer");
  const priceValueEl = document.getElementById("summaryPrice");
  const discountEl = document.getElementById("summaryDiscount");
  const deliveryEl = document.getElementById("summaryDelivery");
  const totalEl = document.getElementById("summaryTotal");
  const saveTextEl = document.getElementById("summarySavings");
  const itemsLabelEl = document.getElementById("summaryItemsLabel");

  // not on cart page or PRODUCTS missing
  if (!itemsContainer || typeof PRODUCTS === "undefined") return;

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
    CART_TOTALS = {
      totalMrp: 0,
      totalPrice: 0,
      discount: 0,
      deliveryCharge: 0,
      grandTotal: 0,
      totalQty: 0,
    };
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

    // --- image path fix ---
    let imgSrc = product.images || "";
    if (imgSrc && !/^https?:\/\//i.test(imgSrc)) {
      imgSrc = "./" + imgSrc.replace(/^\.?\//, "");
    }

    const row = document.createElement("div");
    row.className = "cart-item-row";
    row.innerHTML = `
      <div class="cart-item-main">
        <img src="${imgSrc}" alt="${product.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-short">${product.short || ""}</div>
          <div class="cart-item-price">
            <span>₹${product.price}</span>
            ${
              mrp > product.price
                ? `<span class="cart-item-mrp">₹${mrp}</span>`
                : ""
            }
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

  // Delivery: simple rules
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

  // save totals globally for "Place order"
  CART_TOTALS = {
    totalMrp,
    totalPrice,
    discount,
    deliveryCharge,
    grandTotal,
    totalQty,
  };

  if (itemsLabelEl)
    itemsLabelEl.textContent = `Price (${totalQty} item${
      totalQty > 1 ? "s" : ""
    })`;
  if (priceValueEl) priceValueEl.textContent = `₹${totalMrp}`;
  if (discountEl) discountEl.textContent = discount ? `- ₹${discount}` : "- ₹0";
  if (deliveryEl) deliveryEl.textContent = deliveryLabel;
  if (totalEl) totalEl.textContent = `₹${grandTotal}`;
  if (saveTextEl)
    saveTextEl.textContent =
      discount > 0 ? `You will save ₹${discount} on this order` : "Great choice!";
}

// ---------- event listeners ----------

// +/- buttons & remove
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

  // PLACE ORDER button
  if (target.matches(".place-order-btn")) {
    handlePlaceOrder();
  }
});

// manual qty change
document.addEventListener("change", function (e) {
  if (e.target.matches(".cart-item-row .qty-input")) {
    const id = e.target.getAttribute("data-id");
    setCartQuantity(id, e.target.value);
  }
});

// pincode check
document.addEventListener("click", function (e) {
  if (e.target && e.target.id === "checkPincodeBtn") {
    renderCart();
  }
});

// initial
document.addEventListener("DOMContentLoaded", function () {
  updateCartBadge();
  if (document.getElementById("cartItemsContainer")) {
    renderCart();
  }
});

// ---------- PLACE ORDER handler ----------

function handlePlaceOrder() {
  const cart = loadCart();
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  if (typeof PRODUCTS === "undefined") {
    alert("Something went wrong. Please refresh the page.");
    return;
  }

  // build order summary
  const lines = cart
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) return null;
      return `${product.name} × ${item.qty} — ₹${product.price * item.qty}`;
    })
    .filter(Boolean);

  const totalLine = `Total: ₹${CART_TOTALS.grandTotal}`;
  const msg = `GreenWrite Order:%0A%0A${lines.join(
    "%0A"
  )}%0A%0A${totalLine}`;

  // your WhatsApp number (change this)
  const phone = "91XXXXXXXXXX"; // e.g. 919876543210

  // open WhatsApp chat
  const url = `https://wa.me/${phone}?text=${msg}`;
  window.open(url, "_blank");
}
