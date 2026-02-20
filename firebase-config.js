/* ============================================
   FIREBASE CONFIGURATION - kyc-vault project
   ============================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, orderBy, limit, getDocs, where, Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase configuration for kyc-vault project
const firebaseConfig = {
    apiKey: "AIzaSyD6a3U8BH8-IjKUBk3GrJqtZakd1L9rIkU",
    authDomain: "kyc-vault.firebaseapp.com",
    projectId: "kyc-vault",
    storageBucket: "kyc-vault.firebasestorage.app",
    messagingSenderId: "301914382550",
    appId: "1:301914382550:web:b3fddd693265377cb3a977",
    measurementId: "G-J0HVH3DLMB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export to window for app.js
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseModules = {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    where,
    Timestamp,
    serverTimestamp,
    sendEmailVerification
};

console.log('🔥 Firebase initialized (kyc-vault project)');
