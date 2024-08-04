// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDXv6uKaqKcRIffREOan_lC_mjB-8Jyis",
  authDomain: "pantry-tracker-app-4c086.firebaseapp.com",
  projectId: "pantry-tracker-app-4c086",
  storageBucket: "pantry-tracker-app-4c086.appspot.com",
  messagingSenderId: "778984164719",
  appId: "1:778984164719:web:41f2a1e3013186044d2c9a",
  measurementId: "G-V21PF8JN1S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}