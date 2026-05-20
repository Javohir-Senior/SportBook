import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAs6vfgqHqpGFoUVjhD_oD6TrE4GkuY80o",
  authDomain: "g-89-1b251.firebaseapp.com",
  projectId: "g-89-1b251",
  storageBucket: "g-89-1b251.firebasestorage.app",
  messagingSenderId: "949109279720",
  measurementId: "G-2VD23Y18N6"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);