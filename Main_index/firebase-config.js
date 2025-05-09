// Firebase Configuration and Utility Functions

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-analytics.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export function getCurrentUser() {
  return auth.currentUser;
}

export function isUserLoggedIn() {
  return auth.currentUser !== null;
}

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function registerUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// User profile functions
export async function createUserProfile(userId, userData) {
  try {
    await setDoc(doc(db, "users", userId), {
      ...userData,
      createdAt: new Date().toISOString(),
      stats: {
        avgWpm: 0,
        avgAccuracy: 0,
        testsTaken: 0,
        bestWpm: 0
      }
    });
    return true;
  } catch (error) {
    console.error("Error creating user profile:", error);
    return false;
  }
}

export async function getUserProfile(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No user profile found!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

export async function updateUserProfile(userId, data) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
}

// Test results functions
export async function saveTestResult(userId, testData) {
  try {
    // Add the test to the user's test history collection
    await addDoc(collection(db, "users", userId, "testHistory"), {
      ...testData,
      timestamp: new Date().toISOString()
    });
    
    // Update user stats
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      const testHistory = await getTestHistory(userId);
      
      // Calculate new stats
      const totalWpm = testHistory.reduce((sum, test) => sum + test.wpm, 0);
      const avgWpm = totalWpm / testHistory.length;
      
      const totalAccuracy = testHistory.reduce((sum, test) => sum + test.accuracy, 0);
      const avgAccuracy = parseFloat((totalAccuracy / testHistory.length).toFixed(1));
      
      const bestWpm = Math.max(...testHistory.map(test => test.wpm), userProfile.stats?.bestWpm || 0);
      
      // Update user profile with new stats
      await updateUserProfile(userId, {
        stats: {
          avgWpm,
          avgAccuracy,
          testsTaken: testHistory.length,
          bestWpm
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error saving test result:", error);
    return false;
  }
}

export async function getTestHistory(userId) {
  try {
    const q = query(
      collection(db, "users", userId, "testHistory"),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const testHistory = [];
    
    querySnapshot.forEach((doc) => {
      testHistory.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return testHistory;
  } catch (error) {
    console.error("Error getting test history:", error);
    return [];
  }
}

export async function getFilteredTestHistory(userId, timeFilter) {
  try {
    let q;
    
    if (timeFilter === 'all') {
      q = query(
        collection(db, "users", userId, "testHistory"),
        orderBy("timestamp", "desc")
      );
    } else {
      q = query(
        collection(db, "users", userId, "testHistory"),
        where("timeSeconds", "==", parseInt(timeFilter)),
        orderBy("timestamp", "desc")
      );
    }
    
    const querySnapshot = await getDocs(q);
    const testHistory = [];
    
    querySnapshot.forEach((doc) => {
      testHistory.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return testHistory;
  } catch (error) {
    console.error("Error getting filtered test history:", error);
    return [];
  }
}

// Export Firebase instances
export { app, auth, db };