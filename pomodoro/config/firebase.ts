import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase Config - Bu değerleri konsol.firebase.google.com'dan kopyala
const firebaseConfig = {
  apiKey: "AIzaSyAGzeN9f3UWGfjWjHgwwtzxwtNw9fNSBKA",
  authDomain: "pomodoro-93e38.firebaseapp.com",
  projectId: "pomodoro-93e38",
  storageBucket: "pomodoro-93e38.firebasestorage.app",
  messagingSenderId: "407993649874",
  appId: "1:407993649874:web:088346842eca91ecb67b0b",
  measurementId: "G-KRFQJCL4N8",
};

// Firebase başlat
const app = initializeApp(firebaseConfig);

// Firestore ve Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
