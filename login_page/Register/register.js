// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

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

// Register form submit
const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Get values
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Get other fields for user profile
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const username = document.getElementById("username").value;

  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      firstName: firstName,
      lastName: lastName,
      username: username || email.split('@')[0],
      email: email,
      createdAt: new Date().toISOString(),
      stats: {
        avgWpm: 0,
        avgAccuracy: 0,
        testsTaken: 0,
        bestWpm: 0
      }
    });
    
    alert("Registration successful! 🎉");
    console.log("User created:", user.email);
    
    // Store user info in session storage for persistence
    sessionStorage.setItem("user", JSON.stringify({
      uid: user.uid,
      email: user.email,
      username: username || email.split('@')[0]
    }));
    
    // Redirect to main app page
    window.location.href = "../../Main_index/index.html";
  } catch (error) {
    const errorMessage = error.message;
    alert("Error: " + errorMessage);
    console.error("Registration error:", error);
  }
}); 
;
