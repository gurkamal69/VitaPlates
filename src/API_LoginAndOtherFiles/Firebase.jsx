import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyC4yBJ5L6-miO9_D7I7IPc-ES7OaE2T-EM",
  authDomain: "vitaplates0.firebaseapp.com",
  projectId: "vitaplates0",
  storageBucket: "vitaplates0.firebasestorage.app",
  messagingSenderId: "384952107254",
  appId: "1:384952107254:web:29d86de1eee574a560ecd7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
