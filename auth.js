// ==========================
//  FIREBASE CONFIG
// ==========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBok3WdamaRJaVCzznMwB-lwHVWoHAM2i4",
  authDomain: "greenwrite-704d9.firebaseapp.com",
  projectId: "greenwrite-704d9",
  storageBucket: "greenwrite-704d9.firebasestorage.app",
  messagingSenderId: "815467329176",
  appId: "1:815467329176:web:2ec72994fe6f7a28eb82ed",
  measurementId: "G-FS2R1TLK41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// Show account chooser every time
provider.setCustomParameters({ prompt: "select_account" });

// Small helper: safely read elements
function $(id) {
  return document.getElementById(id);
}

// ==========================
//  RENDER USER IN NAV
// ==========================
function renderUser(userLike) {
  const loginBtn = $("loginBtn");
  const logoutBtn = $("logoutBtn");
  const userBox = $("userBox");

  if (!loginBtn || !logoutBtn || !userBox) {
    // Nav not present on this page, nothing to render
    return;
  }

  if (userLike) {
    const name = userLike.displayName || userLike.name || "GreenWrite user";
    const email = userLike.email || "";
    const photo =
      userLike.photoURL ||
      userLike.photo ||
      // fallback avatar
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=16a34a&color=ffffff`;

    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-flex";

    userBox.innerHTML = `
      <img src="${photo}" alt="${name}">
      <span>${name}</span>
    `;
    userBox.title = email || name;
  } else {
    loginBtn.style.display = "inline-flex";
    logoutBtn.style.display = "none";
    userBox.innerHTML = "";
    userBox.removeAttribute("title");
  }
}

// ==========================
//  LOCAL STORAGE HELPERS
// ==========================
const LS_KEY = "gwUser";

function saveUserToStorage(user) {
  if (!user) {
    localStorage.removeItem(LS_KEY);
    return;
  }
  const payload = {
    name: user.displayName || "",
    email: user.email || "",
    photo: user.photoURL || ""
  };
  localStorage.setItem(LS_KEY, JSON.stringify(payload));
}

function getUserFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Render from storage immediately (smooth UX while Firebase initializes)
document.addEventListener("DOMContentLoaded", () => {
  const stored = getUserFromStorage();
  if (stored) {
    renderUser(stored);
  }
});

// ==========================
//  LOGIN BUTTON HANDLER
// ==========================
window.googleLogin = function () {
  const loginBtn = $("loginBtn");

  // Prevent spam clicks
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.style.opacity = "0.7";
  }

  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      saveUserToStorage(user);
      renderUser(user);
      alert("Login Successful! 👏");
    })
    .catch((error) => {
      console.error("Google login error:", error);
      alert("Login Failed ❌\n\n" + (error.message || "Please try again."));
    })
    .finally(() => {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.style.opacity = "";
      }
    });
};

// ==========================
//  LOGOUT
// ==========================
window.logoutUser = function () {
  signOut(auth)
    .catch((error) => {
      console.error("Logout error:", error);
    })
    .finally(() => {
      saveUserToStorage(null);
      // Hard reload so all pages (cart, nav etc.) see logged-out state
      location.reload();
    });
};

// ==========================
//  AUTO CHECK LOGIN STATE
// ==========================
onAuthStateChanged(auth, (user) => {
  if (user) {
    saveUserToStorage(user);
    renderUser(user);
  } else {
    saveUserToStorage(null);
    renderUser(null);
  }
});
