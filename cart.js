/* =========================================================
   GreenWrite Cart Logic
   - Per-user cart (based on Google login from auth.js)
   - Works with:
       - index.html
       - products.html
       - product.html
       - cart.html
   - Uses PRODUCTS from products-data.js
========================================================= */

/* ---------------- Utility: Current user & cart key ---------------- */

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("gwUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getCartKey() {
  const user = getCurrentUser();
  if (user && user.email) {
    // Unique cart per user
    return "gwCart_" + user.email;
  }
  // Guest cart
  return "gwCart_guest";
}

function loadCart() {
  try {
    const raw = localStorage.getItem(getCartKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(getCartKey(), JSON.stringify(cart || []));
}

/* Cart item format:
   {
     productId: string,
     qty: number
   }
*/

/* ---------------- Core Cart Helpers ---------------- */

function findProductById(id) {
  if (!Array.isArray(window.PRODUCTS)) return null;
  return window.PRODUCTS.find((p) => String(p.id) === String(id)) || null;
}

function addToCart(productId, qty = 1) {
  const product = findProductById(productId);
  if (!product) {
    console.warn("Product not found for id:", productId);
    return;
  }

  const cart = loadCart();
  const existing = cart.find((item) => item.productId === productId);

  const addQty = Math.max(1, parseInt(qty, 10) || 1);

  if (existing) {
    existing.qty += addQty;
  } else {
    cart.push({ productId: productId, qty: addQty });
  }

  saveCart(cart);
  updateCartCount();
}

function removeFromCart(productId) {
  const cart = loadCart().filter((item) => item.productId !== productId);
  saveCart(cart);
  updateCartCount();
}

function updateQuantity(productId, newQty) {
  const qty = Math.max(1, parseInt(newQty, 10) || 1);
  const cart = loadCart();
  const item = cart.find((i) => i.productId === productId);
  if (!item) return;

  item.qty = qty;
  saveCart(cart);
  updateCartCount();
}

function clearCart() {
  saveCart([]);
  updateCartCount();
}

/* ---------------- Totals / Summary ---------------- */

function getCartDetails() {
  const cart = loadCart();
  let itemsCount = 0;
  let mrpTotal = 0;
  let priceTotal = 0;

  cart.forEach((item) => {
    const product = findProductById(item.productId);
    if (!product) return;

    const qty = item.qty || 1;
    itemsCount += qty;

    const mrp = product.mrp || product.price || 0;
    const price = product.price || 0;

    mrpTotal += mrp * qty;
    priceTotal += price * qty;
  });

  const discount = Math.max(0, mrpTotal - priceTotal);

  return {
    cart,
    itemsCount,
    mrpTotal,
    priceTotal,
    discount,
  };
}

/* ---------------- Navbar Cart Badge ---------------- */

function updateCartCount() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  const { itemsCount } = getCartDetails();

  if (!itemsCount) {
    badge.textContent = "0";
    badge.style.visibility = "hidden";
  } else {
    badge.textContent = String(itemsCount);
    badge.style.visibility = "visible";
  }
}

// Some older code may call updateCartBadge()
function updateCartBadge() {
  updateCartCount();
}

/* ---------------- Cart Page Rendering ---------------- */

function renderCartPage() {
  const container = document.getElementById("cartItemsContainer");
  if (!container) return; // not on cart page

  const {
    cart,
    itemsCount,
    mrpTotal,
    priceTotal,
    discount,
  } = getCartDetails();

  const summaryItemsCount = document.getElementById("summaryItemsCount");
  const summaryMrp = document.getElementById("summaryMrp");
  const summaryDiscount = document.getElementById("summaryDiscount");
  const summaryTotal = document.getElementById("summaryTotal");
  const summarySavingsText = document.getElementById("summarySavingsText");
  const summaryDeliveryText = document.getElementById("summaryDeliveryText");

  if (summaryItemsCount) summaryItemsCount.textContent = String(itemsCount);
  if (summaryMrp) summaryMrp.textContent = mrpTotal.toString();
  if (summaryDiscount) summaryDiscount.textContent = discount.toString();
  if (summaryTotal) summaryTotal.textContent = priceTotal.toString();
  if (summarySavingsText) {
    summarySavingsText.textContent =
      discount > 0
        ? `You will save ₹${discount} on this order`
        : "Add more eco products to unlock bigger savings.";
  }
  if (summaryDeliveryText && !summaryDeliveryText.dataset.fixed) {
    summaryDeliveryText.textContent = "Enter pincode";
  }

  if (!cart.length) {
    container.innerHTML = `
      <div class="cart-empty">
        Your cart is empty.<br/>
        <a href="products.html" style="color:#0b5ed7;font-weight:600;margin-top:0.5rem;display:inline-block;">
          Browse eco products →
        </a>
      </div>
    `;
    return;
  }

  // Build items HTML
  let html = "";
  cart.forEach((item) => {
    const product = findProductById(item.productId);
    if (!product) return;

    const qty = item.qty || 1;
    const price = product.price || 0;
    const mrp = product.mrp || price;

    let priceHtml = `<span class="cart-item-price-current">₹${price}</span>`;
    if (mrp > price) {
      const offPercent = Math.round(((mrp - price) / mrp) * 100);
      priceHtml = `
        <span class="cart-item-price-current">₹${price}</span>
        <span class="cart-item-price-old">₹${mrp}</span>
        <span class="cart-item-price-off">${offPercent}% off</span>
      `;
    }

    html += `
      <div class="cart-item-row" data-product-id="${item.productId}">
        <div class="cart-item-imgwrap">
          ${
            product.image
              ? `<img src="${product.image}" alt="${product.name}">`
              : `<span style="font-size:2rem;">🖊️</span>`
          }
        </div>

        <div>
          <div class="cart-item-main-title">${product.name}</div>
          <div class="cart-item-meta">
            ${product.tagLabel || product.category || "Eco product"}
          </div>
          <div class="cart-item-seller">
            Sold by GreenWrite • Qty: ${qty}
          </div>

          <div class="cart-item-price-row">
            ${priceHtml}
          </div>

          <div class="cart-item-actions-row">
            <div class="qty-control">
              <button class="qty-btn qty-btn-minus" type="button">−</button>
              <div class="qty-value">${qty}</div>
              <button class="qty-btn qty-btn-plus" type="button">+</button>
            </div>

            <div class="cart-item-links">
              <span class="cart-item-link remove">Remove</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Attach events
  container.querySelectorAll(".cart-item-row").forEach((row) => {
    const productId = row.getAttribute("data-product-id");
    if (!productId) return;

    const minusBtn = row.querySelector(".qty-btn-minus");
    const plusBtn = row.querySelector(".qty-btn-plus");
    const qtyDisplay = row.querySelector(".qty-value");
    const removeLink = row.querySelector(".cart-item-link.remove");

    if (minusBtn && qtyDisplay) {
      minusBtn.addEventListener("click", () => {
        const current = parseInt(qtyDisplay.textContent, 10) || 1;
        const newQty = Math.max(1, current - 1);
        updateQuantity(productId, newQty);
        renderCartPage();
      });
    }

    if (plusBtn && qtyDisplay) {
      plusBtn.addEventListener("click", () => {
        const current = parseInt(qtyDisplay.textContent, 10) || 1;
        const newQty = current + 1;
        updateQuantity(productId, newQty);
        renderCartPage();
      });
    }

    if (removeLink) {
      removeLink.addEventListener("click", () => {
        removeFromCart(productId);
        renderCartPage();
      });
    }
  });
}

/* ---------------- Pincode & Delivery (Cart page) ---------------- */

function setupPincodeHandler() {
  const pinInput = document.getElementById("pincodeInput");
  const pinBtn = document.getElementById("pincodeBtn");
  const deliveryText = document.getElementById("summaryDeliveryText");
  const addressText = document.getElementById("cartAddressText");
  const addressTextSummary = document.getElementById("cartAddressText-summary");

  if (!pinInput || !pinBtn) return; // not on cart page

  function applyShipping(pin) {
    const details = getCartDetails();
    const cartTotal = details.priceTotal || 0;

    let shipping = 0;
    let msg = "";
    if (cartTotal >= 999) {
      shipping = 0;
      msg = "Free delivery";
    } else {
      shipping = 80;
      msg = `₹${shipping} — free above ₹999`;
    }

    const summaryTotal = document.getElementById("summaryTotal");
    if (summaryTotal) {
      summaryTotal.textContent = (cartTotal + shipping).toString();
    }

    if (deliveryText) {
      deliveryText.textContent = msg;
      // mark as "user set", so renderCartPage does not override it
      deliveryText.dataset.fixed = "1";
    }

    if (addressText) {
      addressText.textContent = `We deliver to pincode ${pin}. Standard delivery 5–7 working days depending on your location.`;
    }
    if (addressTextSummary) {
      addressTextSummary.textContent = `Pincode ${pin}, approx. 5–7 working days.`;
    }

    // save to localStorage (per user) so it stays
    const key = getCartKey() + "_shipping";
    localStorage.setItem(
      key,
      JSON.stringify({
        pin,
        shipping,
      })
    );
  }

  // Load saved pincode/shipping if available
  try {
    const key = getCartKey() + "_shipping";
    const raw = localStorage.getItem(key);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.pin) {
        pinInput.value = data.pin;
        applyShipping(data.pin);
      }
    }
  } catch {}

  pinBtn.addEventListener("click", () => {
    const pin = pinInput.value.trim();
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }
    applyShipping(pin);
  });
}

/* ---------------- Init on DOMContentLoaded ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  // Update navbar badge on every page
  updateCartCount();

  // If on cart page, render items and setup pincode handling
  renderCartPage();
  setupPincodeHandler();
});

/* ---------------- Expose to window (for inline HTML calls) ---------------- */

window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
window.updateCartBadge = updateCartBadge;
window.renderCartPage = renderCartPage;
window.clearCart = clearCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
