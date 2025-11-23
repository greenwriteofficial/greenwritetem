// cart.js – shared cart logic for all pages

(function () {
  const CART_KEY = "greenwrite_cart";

  function formatINR(num) {
    return Number(num || 0).toLocaleString("en-IN");
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Error reading cart from localStorage", e);
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  // ===== Public: addToCart(productId, qty) =====
  window.addToCart = function addToCart(productId, qty) {
    const quantity = Math.max(1, parseInt(qty, 10) || 1);
    const cart = loadCart();
    const existing = cart.find((item) => item.id === productId);

    if (existing) {
      existing.qty += quantity;
    } else {
      cart.push({ id: productId, qty: quantity });
    }

    saveCart(cart);
    updateCartCountBadge();
  };

  // ===== Cart badge in navbar =====
  window.updateCartCountBadge = function updateCartCountBadge() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;

    const cart = loadCart();
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    badge.textContent = totalQty;
  };

  // ===== Helpers for cart page =====
  function getDetailedCartItems() {
    if (!Array.isArray(window.PRODUCTS)) {
      console.error("PRODUCTS not loaded. Include products-data.js before cart.js");
      return [];
    }

    const productsById = {};
    for (const p of window.PRODUCTS) {
      productsById[p.id] = p;
    }

    const rawCart = loadCart();
    return rawCart
      .map((entry) => {
        const product = productsById[entry.id];
        if (!product) return null;
        return {
          product,
          qty: Math.max(1, parseInt(entry.qty, 10) || 1),
        };
      })
      .filter(Boolean);
  }

  function calcTotals(detailedItems, deliveryFee) {
    const itemsCount = detailedItems.reduce((s, i) => s + i.qty, 0);
    const mrpTotal = detailedItems.reduce(
      (s, i) => s + (i.product.mrp || i.product.price) * i.qty,
      0
    );
    const priceTotal = detailedItems.reduce(
      (s, i) => s + i.product.price * i.qty,
      0
    );
    const discount = mrpTotal - priceTotal;
    const delivery = detailedItems.length ? deliveryFee : 0;
    const total = priceTotal + delivery;

    return { itemsCount, mrpTotal, priceTotal, discount, delivery, total };
  }

  // ===== Render cart page =====
  window.initCartPage = function initCartPage() {
    const itemsContainer = document.getElementById("cartItems");
    if (!itemsContainer) return; // not on cart page

    let detailed = getDetailedCartItems();
    let deliveryFee = 0;

    const itemsLabelEl = document.getElementById("summaryItemsLabel");
    const priceEl = document.getElementById("summaryPrice");
    const discountEl = document.getElementById("summaryDiscount");
    const deliveryEl = document.getElementById("summaryDelivery");
    const totalEl = document.getElementById("summaryTotal");
    const saveLineEl = document.getElementById("summarySaveLine");

    const pinInput = document.getElementById("pincodeInput");
    const pinBtn = document.getElementById("pincodeCheck");

    function syncStorage() {
      const compact = detailed.map((i) => ({ id: i.product.id, qty: i.qty }));
      saveCart(compact);
      updateCartCountBadge();
    }

    function updateSummary() {
      const totals = calcTotals(detailed, deliveryFee);

      if (itemsLabelEl) {
        itemsLabelEl.textContent = `Price (${totals.itemsCount} item${
          totals.itemsCount === 1 ? "" : "s"
        })`;
      }
      if (priceEl) priceEl.textContent = "₹" + formatINR(totals.priceTotal);
      if (discountEl)
        discountEl.textContent =
          totals.discount > 0 ? "- ₹" + formatINR(totals.discount) : "₹0";
      if (deliveryEl)
        deliveryEl.textContent = totals.delivery
          ? "₹" + formatINR(totals.delivery)
          : "Free";
      if (totalEl) totalEl.textContent = "₹" + formatINR(totals.total);
      if (saveLineEl)
        saveLineEl.textContent =
          totals.discount > 0
            ? `You will save ₹${formatINR(totals.discount)} on this order`
            : "You will save ₹0 on this order";
    }

    function renderItems() {
      itemsContainer.innerHTML = "";

      if (!detailed.length) {
        itemsContainer.innerHTML =
          '<p class="cart-empty">Your cart is empty. Add something from the Products page.</p>';
        updateSummary();
        return;
      }

      detailed.forEach((item, index) => {
        const p = item.product;
        const mrpHtml =
          p.mrp && p.mrp > p.price
            ? `<span class="cart-item-mrp">₹${formatINR(p.mrp)}</span>`
            : "";

        const row = document.createElement("div");
        row.className = "cart-item-row";
        row.innerHTML = `
          <div class="cart-item">
            <div class="cart-item-image">
              <img src="${p.images || ""}" alt="${p.name}">
            </div>
            <div class="cart-item-main">
              <div class="cart-item-title">${p.name}</div>
              <div class="cart-item-meta">${
                p.category || "Plantable stationery"
              }</div>
              <div class="cart-item-price-row">
                <span class="cart-item-price-now">₹${formatINR(p.price)}</span>
                ${mrpHtml}
              </div>
              <div class="cart-item-actions">
                <div class="cart-qty-control">
                  <button type="button" class="qty-btn qty-minus" data-index="${index}">-</button>
                  <span class="qty-value">${item.qty}</span>
                  <button type="button" class="qty-btn qty-plus" data-index="${index}">+</button>
                </div>
                <button type="button" class="link-btn remove-btn" data-index="${index}">Remove</button>
              </div>
            </div>
          </div>
        `;
        itemsContainer.appendChild(row);
      });

      // Attach events
      itemsContainer
        .querySelectorAll(".qty-minus")
        .forEach((btn) =>
          btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index, 10);
            if (!Number.isInteger(idx) || !detailed[idx]) return;
            if (detailed[idx].qty > 1) detailed[idx].qty -= 1;
            else detailed.splice(idx, 1);
            syncStorage();
            renderItems();
            updateSummary();
          })
        );

      itemsContainer
        .querySelectorAll(".qty-plus")
        .forEach((btn) =>
          btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index, 10);
            if (!Number.isInteger(idx) || !detailed[idx]) return;
            detailed[idx].qty += 1;
            syncStorage();
            renderItems();
            updateSummary();
          })
        );

      itemsContainer
        .querySelectorAll(".remove-btn")
        .forEach((btn) =>
          btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index, 10);
            if (!Number.isInteger(idx) || !detailed[idx]) return;
            detailed.splice(idx, 1);
            syncStorage();
            renderItems();
            updateSummary();
          })
        );
    }

    // Pincode + delivery calculation
    if (pinBtn) {
      pinBtn.addEventListener("click", () => {
        if (!detailed.length) {
          alert("Add at least one product to check delivery.");
          return;
        }
        const pin = (pinInput.value || "").trim();
        if (!/^\d{6}$/.test(pin)) {
          alert("Please enter a valid 6-digit pincode.");
          return;
        }

        // Very simple rule: free delivery above ₹299, else ₹40
        const priceOnly = detailed.reduce(
          (s, i) => s + i.product.price * i.qty,
          0
        );
        deliveryFee = priceOnly >= 299 ? 0 : 40;
        updateSummary();
      });
    }

    // Initial render
    renderItems();
    updateSummary();
  };

  // Run on every page to keep badge in sync
  document.addEventListener("DOMContentLoaded", function () {
    if (typeof updateCartCountBadge === "function") {
      updateCartCountBadge();
    }
    if (document.getElementById("cartItems")) {
      initCartPage();
    }
  });
})();
