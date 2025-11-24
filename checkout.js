// checkout.js – UI + summary + building order object; Firestore call via window.saveOrderToFirebase

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

// Try to fetch raw cart array from multiple sources
function getRawCartArray() {
  // 1) If cart.js exposes getCartDetails()
  if (typeof window.getCartDetails === "function") {
    try {
      const details = window.getCartDetails();
      if (details && Array.isArray(details.cart)) {
        return details.cart;
      }
    } catch (e) {
      console.warn("Error calling getCartDetails:", e);
    }
  }

  // 2) If cart.js exposes getCart()
  if (typeof window.getCart === "function") {
    try {
      const c = window.getCart();
      if (Array.isArray(c)) return c;
    } catch (e) {
      console.warn("Error calling getCart():", e);
    }
  }

  // 3) Fallback: read from localStorage by common keys
  const possibleKeys = ["gwCart_guest", "gwCart", "cart", "greenwrite_cart"];
  for (const key of possibleKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
      if (parsed && Array.isArray(parsed.items) && parsed.items.length) {
        return parsed.items;
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  return [];
}

// Build a clean summary object from whatever cart structure we find
function computeCartSummary() {
  const rawCart = getRawCartArray();

  let cartItems = [];
  let itemsCount = 0;
  let mrpTotal = 0;
  let priceTotal = 0;

  rawCart.forEach((item) => {
    const productId = item.productId ?? item.id ?? item.productID;
    const qty = item.qty ?? item.quantity ?? 1;

    let price = item.price ?? 0;
    let mrp = item.mrp ?? price;
    let name = item.name || item.title || `Item ${productId}`;

    // Try to override with product info from PRODUCTS
    if (Array.isArray(window.PRODUCTS) && productId != null) {
      const prod = window.PRODUCTS.find(
        (p) =>
          String(p.id) === String(productId) ||
          String(p.productId) === String(productId)
      );
      if (prod) {
        name = prod.name || name;
        // use product price
        price = prod.price ?? prod.mrp ?? price ?? 0;
        mrp = prod.mrp ?? prod.price ?? price;
      }
    }

    cartItems.push({
      productId,
      name,
      qty,
      price,
      mrp,
      supplierId: item.supplierId || "default-supplier",
    });

    itemsCount += qty;
    mrpTotal += mrp * qty;
    priceTotal += price * qty;
  });

  const discount = mrpTotal - priceTotal;

  return {
    cartItems,
    itemsCount,
    mrpTotal,
    priceTotal,
    discount: discount < 0 ? 0 : discount,
  };
}

// Split items by supplier for future emails / dashboards
function buildSupplierSplit(items) {
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

function renderOrderSummary() {
  const summary = computeCartSummary();

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

  // Render line items
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

  // Update navbar cart count if available
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const summary = computeCartSummary();
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

    const paymentStatus = paymentMethod === "PREPAID" ? "paid" : "pending";

    const orderItems = summary.cartItems;
    const supplierSplit = buildSupplierSplit(orderItems);
    const currentUser = getCurrentUserSafe();

    const orderData = {
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
      user: currentUser || null,
      items: orderItems,
      suppliers: supplierSplit,
    };

    try {
      if (buttonEl) {
        buttonEl.disabled = true;
        buttonEl.textContent = "Placing order…";
      }
      if (statusEl) {
        statusEl.textContent = "Saving your order…";
      }

      let orderId = null;

      if (typeof window.saveOrderToFirebase === "function") {
        orderId = await window.saveOrderToFirebase(orderData);
      } else {
        console.warn(
          "saveOrderToFirebase not available, skipping Firestore save"
        );
      }

      if (statusEl) {
        statusEl.textContent = orderId
          ? `Order placed! ID: ${orderId}`
          : "Order placed (local only).";
      }

      // Clear cart
      if (typeof window.clearCart === "function") {
        window.clearCart();
      }

      alert("Your order has been placed! We'll contact you shortly.");
      window.location.href = "index.html";
    } catch (err) {
      console.error("Error placing order:", err);
      if (statusEl) {
        statusEl.textContent =
          "Error placing order. Please refresh the page and try again.";
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
