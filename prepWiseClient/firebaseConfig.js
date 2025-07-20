// firebaseConfig.js
import 'react-native-get-random-values'; // חובה ל-Firestore ב־React Native
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDuB3T0gKXQJrv6YK8D9iFJI6bX215a3wM",
  authDomain: "prepwise-596a2.firebaseapp.com",
  projectId: "prepwise-596a2",
  storageBucket: "prepwise-596a2.firebasestorage.com",
  messagingSenderId: "485185506665",
  appId: "1:485185506665:web:9b7f7ace8dad3ae13c01f8",
  //measurementId: "G-F7GKK6V6MC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db,storage  };