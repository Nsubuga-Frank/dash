// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDHNFU09W086LFFOpq_YdlVWBJRv5SEOmU",
  authDomain: "polaris-db-537c2.firebaseapp.com",
  projectId: "polaris-db-537c2",
  storageBucket: "polaris-db-537c2.firebasestorage.app",
  messagingSenderId: "144484245141",
  appId: "1:144484245141:web:4b9e283bd8c6879d4d459c",
  measurementId: "G-RRSKSGB4Y9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, auth, db };
