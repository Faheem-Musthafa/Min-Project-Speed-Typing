// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
const auth = getAuth(app); // Fix: initialize auth

// Register form submit
const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get values
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Optional: get other fields if you want to store them later
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const username = document.getElementById("username").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      alert("Registration successful! 🎉");
      console.log("User:", user);

      Optional: Redirect;
      window.location.href = "Grand.html";
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert("Error: " + errorMessage);
      console.error(error);
    });
});
