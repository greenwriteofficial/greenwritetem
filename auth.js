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


// ==========================
//  LOGIN BUTTON HANDLER
// ==========================
window.googleLogin = function () {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;

      localStorage.setItem("gwUser", JSON.stringify({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
      }));

      alert("Login Successful! 👏");
      location.reload();
    })
    .catch((error) => {
      console.error(error);
      alert("Login Failed ❌");
    });
};


// ==========================
//  LOGOUT
// ==========================
window.logoutUser = function () {
  signOut(auth).then(() => {
    localStorage.removeItem("gwUser");
    location.reload();
  });
};


// ==========================
//  AUTO CHECK LOGIN STATE
// ==========================
onAuthStateChanged(auth, (user) => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userBox = document.getElementById("userBox");

  if (user) {
    // Logged in
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    if (userBox) {
      userBox.innerHTML = `
        <img src="${user.photoURL}" style="width:32px;border-radius:50%;">  
        <span>${user.displayName}</span>
      `;
    }

  } else {
    // Logged out
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";

    if (userBox) userBox.innerHTML = "";
  }
});

