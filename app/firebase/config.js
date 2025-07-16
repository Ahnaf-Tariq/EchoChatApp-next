// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmBrK2KDYM_vUGgv9QThRs_DYet1Syalw",
  authDomain: "chatapp-nextjs-e25a3.firebaseapp.com",
  projectId: "chatapp-nextjs-e25a3",
  storageBucket: "chatapp-nextjs-e25a3.firebasestorage.app",
  messagingSenderId: "313739431490",
  appId: "1:313739431490:web:21184c39e7a03ad5bf27db",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
