import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// --- ADD THIS LINE ---
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyCn51kkh15xrUhXrpcnUMdwzrZzu6sUWWw",
  authDomain: "urban-smart-city-project.firebaseapp.com",
  projectId: "urban-smart-city-project",
  storageBucket: "urban-smart-city-project.firebasestorage.app",
  messagingSenderId: "612588945384",
  appId: "1:612588945384:web:38a91a6c96486cd5682e5d",
  measurementId: "G-ECC97G6NHJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and Export Services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
// --- ADD THIS LINE SO YOUR REPORTS WORK ---
export const db = getFirestore(app);