
import { initializeApp, getApps, getApp } from 'https://esm.sh/firebase@10.8.1/app';
import { getFirestore } from 'https://esm.sh/firebase@10.8.1/firestore';

const defaultConfig = {
  apiKey: "AIzaSyALTwIfX0TcABVk6hH2CYbVEf3VTsisewA",
  authDomain: "rushi-83249.firebaseapp.com",
  projectId: "rushi-83249",
  storageBucket: "rushi-83249.firebasestorage.app",
  messagingSenderId: "644715981919",
  appId: "1:644715981919:web:1a183b3e398a653688ffea",
  measurementId: "G-6QP1GFF766"
};

// Prioritize environment variable, fallback to hardcoded user config
const firebaseConfig = process.env.FIREBASE_CONFIG 
  ? JSON.parse(process.env.FIREBASE_CONFIG) 
  : defaultConfig;

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export default db;
