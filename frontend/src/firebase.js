import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your config
const firebaseConfig = {
    apiKey: "AIzaSyD7Lj3xmNzIxugE1IHXh1Hbq-B4h4h5e3A",
    authDomain: "swachhdrishti.firebaseapp.com",
    projectId: "swachhdrishti",
    storageBucket: "swachhdrishti.firebasestorage.app",
    messagingSenderId: "34913462826",
    appId: "1:34913462826:web:1004ba38228372295c3153"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 ADD THESE LINES
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);