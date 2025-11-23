// cart.js

const CART_KEY = "greenwrite_cart_v1";

/* ================== STORAGE HELPERS ================== */

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error reading cart", err);
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* ================== PUBLIC CART API ================== */

function getCart() {
  return readCart();
}

function getCartCount() {
  return readCart().reduce((sum, item) => sum + (item.qty || 1), 0);
}

function addToCart(productId, qty = 1) {
  const cart = readCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty = (existing.qty || 1) + qty;
  } else {
    cart.push({ id: productId, qty });
  }

  writeCart(cart);
  updateCartBadge();
}

function removeFromCart(productId) {
  const cart = readCart().filter((item) => item.id !== productId);
  writeCart(cart);
  updateCartBadge();
}

function setCartQty(productId, qty) {
  const cart = readCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.qty = Math.max(1, parseInt(qty, 10) || 1);
  writeCart(cart);
  updateCartBadge();
}

/* ================== NAVBAR BADGE ================== */

function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  const count = getCartCount();
  badge.textContent = count;
  badge.style.visibility = count > 0 ? "visible" : "hidden";
}

document.addEventListener("DOMContentLoaded", updateCartBadge);

/* ================== CART PAGE RENDER ================== */

function renderCartPage() {
  // Only run on cart.html
  if (!document.getElementById("cartItemsContainer")) return;
  if (!window.PRODUCTS) {
    console.error("PRODUCTS not found. Is products-data.js loaded before cart.js?");
    return;
  }

  const itemsContainer = document.getElementById("cartItemsContainer");
  const itemsCountEl = document.getElementById("summaryItemsCount");
  const mrpEl = document.getElementById("summaryMrp");
  const discountEl = document.getElementById("summaryDiscount");
  const totalEl = document.getElementById("summaryTotal");
  const savingsTextEl = document.getElementById("summarySavingsText");
  const deliveryTextEl = document.getElementById("summaryDeliveryText");
  const addressTextEl = document.getElementById("cartAddressText");
  const pincodeInput = document.getElementById("pincodeInput");
  const pincodeBtn = document.getElementById("pincodeBtn");

  let currentShippingCharge = 0;

  function formatPrice(n) {
    return n.toLocaleString("en-IN");
  }

  function calculateShipping(pin) {
    if (!/^\d{6}$/.test(pin)) {
      return { charge: 0, eta: "", message: "Please enter a valid 6-digit pincode." };
    }
    const prefix = pin.slice(0, 2);
    let charge, eta;
    if (["11", "12", "13"].includes(prefix)) {
      charge = 30; eta = "2–4 days";
    } else if (["40", "41", "42", "56", "57"].includes(prefix)) {
      charge = 40; eta = "4–7 days";
    } else {
      charge = 60; eta = "5–9 days";
    }
    return { charge, eta, message: charge === 0 ? "FREE delivery" : `₹${charge} • ${eta}` };
  }

  function renderCart() {
    const cart = getCart();
    itemsContainer.innerHTML = "";

    if (!cart.length) {
      itemsContainer.innerHTML =
        `<div class="cart-empty">Your cart is empty. Add some GreenWrite products! 🌱</div>`;
      itemsCountEl.textContent = 0;
      mrpEl.textContent = "0";
      discountEl.textContent = "0";
      totalEl.textContent = "0";
      deliveryTextEl.textContent = "Enter pincode";
      savingsTextEl.textContent = "You will save ₹0 on this order";
      return;
    }

    let totalItems = 0;
    let totalMrp = 0;
    let totalPrice = 0;

    cart.forEach((item) => {
      const product = window.PRODUCTS.find((p) => p.id === item.id);
      if (!product) return;

      const qty = item.qty || 1;
      totalItems += qty;

      const price = product.price;
      const mrp = product.mrp || price;
      totalMrp += mrp * qty;
      totalPrice += price * qty;

      const offPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

      const row = document.createElement("div");
      row.className = "cart-item-row";
      row.innerHTML = `
        <div class="cart-item-imgwrap">
          ${product.image ? `<img src="${product.image}" alt="${product.name}">` : ""}
        </div>
        <div>
          <div class="cart-item-main-title">${product.name}</div>
          <div class="cart-item-meta">${product.category || ""}</div>
          <div class="cart-item-seller">Seller: GreenWrite</div>

          <div class="cart-item-price-row">
            <span class="cart-item-price-current">₹${formatPrice(price)}</span>
            ${mrp > price ? `<span class="cart-item-price-old">₹${formatPrice(mrp)}</span>` : ""}
            ${offPercent > 0 ? `<span class="cart-item-price-off">${offPercent}% Off</span>` : ""}
          </div>

          <div class="cart-item-actions-row">
            <div class="qty-control">
              <button class="qty-btn" data-action="dec" data-id="${product.id}">−</button>
              <div class="qty-value" data-id="${product.id}">${qty}</div>
              <button class="qty-btn" data-action="inc" data-id="${product.id}">+</button>
            </div>

            <div class="cart-item-links">
              <span class="cart-item-link remove" data-action="remove" data-id="${product.id}">
                REMOVE
              </span>
            </div>
          </div>
        </div>
      `;
      itemsContainer.appendChild(row);
    });

    const totalDiscount = totalMrp - totalPrice;
    const grandTotal = totalPrice + currentShippingCharge;

    itemsCountEl.textContent = totalItems;
    mrpEl.textContent = formatPrice(totalMrp);
    discountEl.textContent = formatPrice(totalDiscount > 0 ? totalDiscount : 0);
    totalEl.textContent = formatPrice(grandTotal);
    savingsTextEl.textContent =
      `You will save ₹${formatPrice(totalDiscount > 0 ? totalDiscount : 0)} on this order`;
  }

  // Quantity + remove handlers
  itemsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "inc") {
      const cart = getCart();
      const item = cart.find((i) => i.id === id);
      if (item) {
        item.qty = (item.qty || 1) + 1;
        writeCart(cart);
        updateCartBadge();
        renderCart();
      }
    } else if (action === "dec") {
      const cart = getCart();
      const item = cart.find((i) => i.id === id);
      if (item) {
        item.qty = Math.max(1, (item.qty || 1) - 1);
        writeCart(cart);
        updateCartBadge();
        renderCart();
      }
    } else if (action === "remove") {
      removeFromCart(id);
      renderCart();
    }
  });

  // Pincode handler
  pincodeBtn.addEventListener("click", () => {
    const pin = (pincodeInput.value || "").trim();
    const { charge, eta } = calculateShipping(pin);
    currentShippingCharge = charge;

    if (!/^\d{6}$/.test(pin)) {
      addressTextEl.textContent = "Please enter a valid 6-digit pincode.";
      deliveryTextEl.textContent = "Enter pincode";
    } else {
      addressTextEl.textContent = `Delivering to ${pin} • ${eta}`;
      deliveryTextEl.textContent = charge ? `₹${charge}` : "FREE";
    }

    renderCart();
  });

  renderCart();
}

// run cart-page rendering after DOM ready
document.addEventListener("DOMContentLoaded", renderCartPage);
