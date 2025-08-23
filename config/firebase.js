// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword,sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, serverTimestamp ,collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp ,setDoc, query, where} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// ====== Firebase Config ======
const firebaseConfig = {
    apiKey: "AIzaSyBR4g-OY8Na8COqNHr8wThsvSOI1NZwsQM",
    authDomain: "opscheduler.firebaseapp.com",
    projectId: "opscheduler",
    storageBucket: "opscheduler.firebasestorage.app",
    messagingSenderId: "29143211270",
    appId: "1:29143211270:web:e8644d6c7d9ac647a35287",
    measurementId: "G-QKPE01LTXY"
};

// ====== Initialize Firebase ======
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ====== Loader Functions ======
function showLoader(message = "Processing...") {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.querySelector("p").textContent = message;
    loader.classList.remove("hidden");
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("hidden");
}

// ====== Export for other modules ======
export {
    app,
    auth,
    db,
    collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, Timestamp,setDoc, query, where, serverTimestamp,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail,
    showLoader, hideLoader
};

