import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrrSPLyEMIgxunqLIuA8mYOaE6hRf6Wh4",
  authDomain: "fit-sync-60509.firebaseapp.com",
  projectId: "fit-sync-60509",
  storageBucket: "fit-sync-60509.firebasestorage.app",
  messagingSenderId: "548788510180",
  appId: "1:548788510180:web:5af6bc0fd754f08c5e3bf1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
