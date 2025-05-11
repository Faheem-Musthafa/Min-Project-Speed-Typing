// Import Firebase services from shared configuration
import { auth, db, googleProvider } from "../../firebase-shared.js";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// DOM elements
const loginBtn = document.getElementById("log");
const togglePassword = document.getElementById("togglePassword");
const passwordField = document.getElementById("password");
const forgotPasswordLink = document.getElementById("forgotPassword");
const googleBtn = document.querySelector(".google-btn");

// Login function
async function handleLogin(email, password) {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error("Please enter both email and password");
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store user info in session storage for persistence
    sessionStorage.setItem("user", JSON.stringify({
      uid: user.uid,
      email: user.email
    }));
    
    console.log("Login successful");
    
    // Redirect to main app page
    window.location.href = "../../Main_index/index.html";
    return true;
  } catch (error) {
    console.error("Login error:", error);
    
    // Provide more user-friendly error messages
    let errorMessage = "Login failed: ";
    
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      errorMessage += "Invalid email or password. Please try again.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage += "Please enter a valid email address.";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage += "Too many failed login attempts. Please try again later.";
    } else {
      errorMessage += error.message;
    }
    
    alert(errorMessage);
    return false;
  }
}

// Login button event
loginBtn.addEventListener("click", async function (event) {
  event.preventDefault(); // Prevent form reload

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  
  // Enhanced validation
  if (!email) {
    alert("Please enter your email address");
    document.getElementById("email").focus();
    return;
  }
  
  if (!password) {
    alert("Please enter your password");
    document.getElementById("password").focus();
    return;
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address");
    document.getElementById("email").focus();
    return;
  }

  // Show loading state
  loginBtn.textContent = "Logging in...";
  loginBtn.disabled = true;
  
  try {
    await handleLogin(email, password);
  } finally {
    // Reset button state if login fails
    loginBtn.textContent = "Log in";
    loginBtn.disabled = false;
  }
});

// Show/Hide Password Toggle
togglePassword.addEventListener("click", function () {
  const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
  passwordField.setAttribute("type", type);

  // Toggle icon
  this.innerHTML = type === "password"
    ? '<i class="fas fa-eye"></i>'
    : '<i class="fas fa-eye-slash"></i>';
});

// Password Reset
forgotPasswordLink.addEventListener("click", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("Please enter your email address first.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent! 📧\nCheck your inbox or spam folder.");
  } catch (error) {
    console.error("Reset password error:", error);
    
    // Provide more user-friendly error messages
    let errorMessage = "Failed to send reset email: ";
    
    if (error.code === "auth/user-not-found") {
      errorMessage = "If this email is registered, you'll receive a password reset link shortly.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Please enter a valid email address.";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Too many requests. Please try again later.";
    } else {
      errorMessage += error.message;
    }
    
    alert(errorMessage);
  }
});

// Google Sign In
googleBtn.addEventListener("click", async function() {
  try {
    // Show loading state
    googleBtn.disabled = true;
    googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    
    // Sign in with Google popup
    const result = await signInWithPopup(auth, googleProvider);
    
    // This gives you a Google Access Token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const user = result.user;
    
    // Check if user profile exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create new user profile if it doesn't exist
      const username = user.displayName || user.email.split('@')[0];
      await setDoc(userDocRef, {
        firstName: user.displayName ? user.displayName.split(' ')[0] : '',
        lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
        username: username,
        email: user.email,
        createdAt: new Date().toISOString(),
        stats: {
          avgWpm: 0,
          avgAccuracy: 0,
          testsTaken: 0,
          bestWpm: 0
        }
      });
    }
    
    // Store user info in session storage for persistence
    sessionStorage.setItem("user", JSON.stringify({
      uid: user.uid,
      email: user.email,
      username: user.displayName || user.email.split('@')[0]
    }));
    
    console.log("Google login successful");
    
    // Redirect to main app page
    window.location.href = "../../Main_index/index.html";
  } catch (error) {
    console.error("Google sign-in error:", error);
    
    // Provide user-friendly error messages
    let errorMessage = "Google sign-in failed: ";
    
    if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "Sign-in cancelled. Please try again.";
    } else if (error.code === "auth/popup-blocked") {
      errorMessage = "Pop-up blocked by browser. Please allow pop-ups for this site.";
    } else if (error.code === "auth/account-exists-with-different-credential") {
      errorMessage = "An account already exists with the same email address but different sign-in credentials.";
    } else {
      errorMessage += error.message;
    }
    
    alert(errorMessage);
    
    // Reset button state
    googleBtn.disabled = false;
    googleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg><span style="margin-left: 10px;">Sign in with google</span>';
  }
});
