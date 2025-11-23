// cart.js

const CART_KEY = "greenwrite_cart_v1";

/* ---------- basic storage helpers ---------- */

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error loading cart", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* ---------- public helpers used in pages ---------- */

function getCart() {
  return loadCart();
}

function getCartCount() {
  return loadCart().reduce((sum, item) => sum + (item.qty || 1), 0);
}

function addToCart(productId, qty = 1) {
  const cart = loadCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty = (existing.qty || 1) + qty;
  } else {
    cart.push({ id: productId, qty });
  }

  saveCart(cart);
  updateCartCount();
}

function setCartItemQty(productId, qty) {
  const cart = loadCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  const q = Math.max(1, parseInt(qty, 10) || 1);
  item.qty = q;
  saveCart(cart);
  updateCartCount();
}

function removeFromCart(productId) {
  const cart = loadCart().filter((i) => i.id !== productId);
  saveCart(cart);
  updateCartCount();
}

/* ---------- navbar badge ---------- */

function updateCartCount() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  const count = getCartCount();
  badge.textContent = count;
  badge.style.visibility = count > 0 ? "visible" : "hidden";
}

document.addEventListener("DOMContentLoaded", updateCartCount);
