// Shared Firebase Configuration
// This file centralizes Firebase configuration to avoid duplication

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBmd3_69bH8Bfoo3gw_GjnCPs-WrpRqdI",
  authDomain: "typooo.firebaseapp.com",
  projectId: "typooo",
  storageBucket: "typooo.appspot.com",
  messagingSenderId: "564981970157",
  appId: "1:564981970157:web:59da8aa939678e102d08e4",
  measurementId: "G-VGKXYB0LGX",
};

// Initialize Firebase core services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Export initialized services
export { app, auth, db, googleProvider };