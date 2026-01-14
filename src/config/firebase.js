import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Replace with user's config
const firebaseConfig = {
    apiKey: "AIzaSyDPu6NgnUI-D33CqzaRDEq9fbhUFdeX13I",
    authDomain: "emg-dashboard-prototype.firebaseapp.com",
    projectId: "emg-dashboard-prototype",
    storageBucket: "emg-dashboard-prototype.firebasestorage.app",
    messagingSenderId: "380024752912",
    appId: "1:380024752912:web:0e4959eab50bc2bd987395",
    measurementId: "G-SDTNKNR9WP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
