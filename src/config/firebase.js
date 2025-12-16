import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with user's config
const firebaseConfig = {
    apiKey: "AIzaSyDPu6NgnUI-D33CqzARDEq9fbhUfDeX13I",
    authDomain: "emg-dashboard-prototype.firebaseapp.com",
    projectId: "emg-dashboard-prototype",
    storageBucket: "emg-dashboard-prototype.firebasestorage.app",
    messagingSenderId: "380024752912",
    appId: "1:380024752912:web:0e4959eab50bc2bd987395",
    measurementId: "G-SDTNKNR9WP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
