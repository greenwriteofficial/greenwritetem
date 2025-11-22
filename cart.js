// cart.js – simple cart using localStorage

const CART_KEY = "gw_cart";

function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Cart parse error", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId, qty) {
  qty = parseInt(qty, 10) || 1;
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  saveCart(cart);
  updateCartCount();
}

function setCartItemQty(productId, qty) {
  qty = parseInt(qty, 10) || 0;
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  if (qty <= 0) {
    const filtered = cart.filter(i => i.id !== productId);
    saveCart(filtered);
  } else {
    item.qty = qty;
    saveCart(cart);
  }
  updateCartCount();
}

function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  updateCartCount();
}

function clearCart() {
  saveCart([]);
  updateCartCount();
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + (item.qty || 0), 0);
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const count = getCartCount();
  el.textContent = count;
  el.style.visibility = count > 0 ? "visible" : "hidden";
}

// keep count in sync
document.addEventListener("DOMContentLoaded", updateCartCount);
