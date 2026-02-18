import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCF26PjgPMI7i-zygHMQgm9jRjpHYYX0mo",
  authDomain: "swaphub-5d705.firebaseapp.com",
  projectId: "swaphub-5d705",
  storageBucket: "swaphub-5d705.firebasestorage.app",
  messagingSenderId: "225323114636",
  appId: "1:225323114636:web:e80b80456ffa48fda55ba9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);