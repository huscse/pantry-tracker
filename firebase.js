// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDc4efej520K-iZNSJdzIooYzyRoM53z5M",
  authDomain: "pantry-tracker-app-d7a0c.firebaseapp.com",
  projectId: "pantry-tracker-app-d7a0c",
  storageBucket: "pantry-tracker-app-d7a0c.appspot.com",
  messagingSenderId: "535336124312",
  appId: "1:535336124312:web:4749ccb3f7ffe8dc8675ed",
  measurementId: "G-E1SF56DGBJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export const auth = getAuth(app);

export {firestore}
