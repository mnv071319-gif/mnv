// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC9UA1iJSBPru-Bsv7tOgrcVQFx2wwbwWA",
  authDomain: "mnvbe-ac1a2.firebaseapp.com",
  projectId: "mnvbe-ac1a2",
  storageBucket: "mnvbe-ac1a2.firebasestorage.app",
  messagingSenderId: "559345722924",
  appId: "1:559345722924:web:e890ec61b3809d8ce2d389",
  measurementId: "G-WB9G4QS6W3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); // Simple initialization

export { getAnalytics };