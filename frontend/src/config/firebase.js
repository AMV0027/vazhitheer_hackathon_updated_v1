import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBO8Hh7yIou1SWGZO79AwQ8BF9v3pAT5Tw",
  authDomain: "valtheerhackathon.firebaseapp.com",
  projectId: "valtheerhackathon",
  storageBucket: "valtheerhackathon.firebasestorage.app",
  messagingSenderId: "682814987672",
  appId: "1:682814987672:web:c0baf9aef4b9ec48d3dfed",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
