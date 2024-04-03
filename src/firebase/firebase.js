import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDlM68fqizRJZ528-0Hb_R8sMmIJKkxAbs",
    authDomain: "projet-pfe-b8307.firebaseapp.com",
    projectId: "projet-pfe-b8307",
    storageBucket: "projet-pfe-b8307.appspot.com",
    messagingSenderId: "531552883729",
    appId: "1:531552883729:web:73e2503b68dc2085264db0"
  };
  const firebase = initializeApp(firebaseConfig);
  const firebaseApp = initializeApp(firebaseConfig);
  const storage = getStorage(firebaseApp);
  const db = getFirestore(firebaseApp);
  export const auth = getAuth()

  export { storage, firebaseApp, db, firebase };
