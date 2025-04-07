// firebaseConfig.js
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   projectId: "polaris-subnet-jobs-123",
//   appId: "1:616407617950:web:6cff6df856dc736d1a868f",
//   storageBucket: "polaris-subnet-jobs-123.firebasestorage.app",
//   apiKey: "AIzaSyDUz4SD8X_ih0OFpnnA4XlpEcAaJBeT6mc",
//   authDomain: "polaris-subnet-jobs-123.firebaseapp.com",
//   messagingSenderId: "616407617950"
// };

const firebaseConfig = {
  apiKey: "AIzaSyDHNFU09W086LFFOpq_YdlVWBJRv5SEOmU",
  authDomain: "polaris-db-537c2.firebaseapp.com",
  projectId: "polaris-db-537c2",
  storageBucket: "polaris-db-537c2.firebasestorage.app",
  messagingSenderId: "144484245141",
  appId: "1:144484245141:web:4b9e283bd8c6879d4d459c",
  measurementId: "G-RRSKSGB4Y9"
};

const readbuddyConfig = {
  apiKey: "AIzaSyB6OZ3-dKIJ1T9W3RFb2XuDSDQJpjB9BAw",
  authDomain: "my-readbuddy.firebaseapp.com",
  projectId: "my-readbuddy",
  storageBucket: "my-readbuddy.appspot.com",
  messagingSenderId: "370909380950",
  appId: "1:370909380950:web:732c74de23e29ccfce96f7",
  measurementId: "G-S4CZ9QJ9J1"
};

// Function to initialize Firebase with a specific config
const initializeFirebase = (configType = 'polaris') => {
  if (getApps().length) {
    getApp().delete();
  }

  // Select the appropriate config
  const activeConfig = configType === 'polaris' ? firebaseConfig : readbuddyConfig;
  const app = initializeApp(activeConfig);

  // Initialize Firestore
  const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
    localCache: false
  });

  // Initialize Auth
  const auth = getAuth(app);

  // Initialize Storage
  const storage = getStorage(app); // Initialize Firebase Storage

  return { db, auth, storage, app };
};

export const configs = {
  polaris: firebaseConfig,
  readbuddy: readbuddyConfig
};

export { initializeFirebase };

// Initialize with default (Polaris) configuration
const { db, auth, storage } = initializeFirebase();

export { auth, storage }; // Export storage
export default db;
