import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyDFUPPw339fVm5MujoYkoCnm7UV0WLa6Fs",
  authDomain: "rentcar-458c3.firebaseapp.com",
  projectId: "rentcar-458c3",
  storageBucket: "rentcar-458c3.firebasestorage.app",
  messagingSenderId: "540003389172",
  appId: "1:540003389172:web:43ff3f1f641b1f900158a1",
  measurementId: "G-CD1P3WV1Z1"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);