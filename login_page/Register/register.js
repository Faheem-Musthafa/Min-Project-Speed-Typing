// Import Firebase services from shared configuration
import { auth, db, googleProvider } from "../../firebase-shared.js";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// DOM elements
const googleBtn = document.querySelector(".google-btn");

// Register form submit handler
document.getElementById("register-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  // Get form values
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const username = document.getElementById("username").value.trim();
  
  // Enhanced validation
  if (!email) {
    alert("Please enter your email address");
    document.getElementById("email").focus();
    return;
  }
  
  if (!password) {
    alert("Please enter a password");
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
  
  // Password strength validation
  if (password.length < 6) {
    alert("Password must be at least 6 characters long");
    document.getElementById("password").focus();
    return;
  }
  
  // Show loading state
  const registerBtn = document.getElementById("register-btn");
  registerBtn.textContent = "Creating account...";
  registerBtn.disabled = true;

  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Generate default username if not provided
    const userDisplayName = username || email.split('@')[0];
    
    try {
      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        username: userDisplayName,
        email,
        createdAt: new Date().toISOString(),
        stats: {
          avgWpm: 0,
          avgAccuracy: 0,
          testsTaken: 0,
          bestWpm: 0
        }
      });
      
      // Store user info in session storage for persistence
      sessionStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        email: user.email,
        username: userDisplayName
      }));
      
      console.log("User created successfully:", user.email);
      alert("Registration successful! 🎉");
      
      // Redirect to main app page
      window.location.href = "../../Main_index/index.html";
    } catch (dbError) {
      console.error("Error creating user profile:", dbError);
      alert("Account created but profile setup failed. Please contact support.");
      // Reset button state
      registerBtn.textContent = "Register";
      registerBtn.disabled = false;
    }
  } catch (error) {
    console.error("Registration error:", error);
    
    // Provide more user-friendly error messages
    let errorMessage = "Registration failed: ";
    
    if (error.code === "auth/email-already-in-use") {
      errorMessage += "This email is already registered. Try logging in instead.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage += "Please enter a valid email address.";
    } else if (error.code === "auth/weak-password") {
      errorMessage += "Password is too weak. Please use a stronger password.";
    } else {
      errorMessage += error.message;
    }
    
    alert(errorMessage);
    
    // Reset button state
    registerBtn.textContent = "Register";
    registerBtn.disabled = false;
  }
});

// Google Sign Up
googleBtn.addEventListener("click", async function() {
  try {
    // Show loading state
    googleBtn.disabled = true;
    googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing up...';
    
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
      
      console.log("New user profile created for Google account:", user.email);
    } else {
      console.log("Existing user signed in with Google:", user.email);
    }
    
    // Store user info in session storage for persistence
    sessionStorage.setItem("user", JSON.stringify({
      uid: user.uid,
      email: user.email,
      username: user.displayName || user.email.split('@')[0]
    }));
    
    alert("Google sign-up successful! 🎉");
    
    // Redirect to main app page
    window.location.href = "../../Main_index/index.html";
  } catch (error) {
    console.error("Google sign-up error:", error);
    
    // Provide user-friendly error messages
    let errorMessage = "Google sign-up failed: ";
    
    if (error.code === "auth/popup-closed-by-user") {
      errorMessage = "Sign-up cancelled. Please try again.";
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
    googleBtn.innerHTML = '<i class="fab fa-google"></i> Sign up with Google';
  }
});
