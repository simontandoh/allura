 // src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBd6QPfX5LYrgK-RfXydjNHQDnF12bwqPs",
  authDomain: "allura-a8a9d.firebaseapp.com",
  projectId: "allura-a8a9d",
  storageBucket: "allura-a8a9d.firebasestorage.app",
  messagingSenderId: "1076664358301",
  appId: "1:1076664358301:web:14a834455bb22be837cb74"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
