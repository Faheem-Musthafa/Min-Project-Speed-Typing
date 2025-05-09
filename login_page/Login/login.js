// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDBmd3_69bH8Bfoo3gw_GjnCPs-WrpRqdI",
  authDomain: "typooo.firebaseapp.com",
  projectId: "typooo",
  storageBucket: "typooo.appspot.com",
  messagingSenderId: "564981970157",
  appId: "1:564981970157:web:59da8aa939678e102d08e4",
  measurementId: "G-VGKXYB0LGX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Login button event
const loginBtn = document.getElementById("log");

loginBtn.addEventListener("click", async function (event) {
  event.preventDefault(); // Prevent form reload

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  try {
    // Firebase login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Logged in as:", user.email);

    // Redirect to main app page
    window.location.href = "../../Main_index/index.html";
    // Store user info in session storage for persistence
    sessionStorage.setItem("user", JSON.stringify({
      uid: user.uid,
      email: user.email
    }));
  } catch (error) {
    const errorMessage = error.message;
    alert("Login failed: " + errorMessage);
    console.error("Login error:", error);
  }
});

// Show/Hide Password Toggle
const togglePassword = document.getElementById("togglePassword");
const passwordField = document.getElementById("password");

togglePassword.addEventListener("click", function () {
  const type =
    passwordField.getAttribute("type") === "password" ? "text" : "password";
  passwordField.setAttribute("type", type);

  // Toggle icon
  this.innerHTML =
    type === "password"
      ? '<i class="fas fa-eye"></i>'
      : '<i class="fas fa-eye-slash"></i>';
});

// Password Reset
const forgotPasswordLink = document.getElementById("forgotPassword");

forgotPasswordLink.addEventListener("click", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;

  if (!email) {
    alert("Please enter your email address first.");
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Password reset email sent! 📧\nCheck your inbox or spam folder.");
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert("Failed to send reset email: " + errorMessage);
      console.error(error);
    });
});
