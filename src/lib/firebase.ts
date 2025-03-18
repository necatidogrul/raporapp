// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJq3TCgyS7ACkkMcXoQoWOFZ3PS-Hiu_Q",
  authDomain: "raporla.firebaseapp.com",
  projectId: "raporla",
  storageBucket: "raporla.firebasestorage.app",
  messagingSenderId: "934651915152",
  appId: "1:934651915152:web:557e1f1644d9648f21a115",
  measurementId: "G-3FBRC7YKB2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
