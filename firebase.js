import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCK3_0SUOrmRVsNCCXGJmXYwSKNvaBJO-8",
  authDomain: "triathlon-455c8.firebaseapp.com",
  projectId: "triathlon-455c8",
  storageBucket: "triathlon-455c8.firebasestorage.app",
  messagingSenderId: "1087991994879",
  appId: "1:1087991994879:web:8c79b6fdebcb6ea2262fca"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
