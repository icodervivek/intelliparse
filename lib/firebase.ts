// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDejRmaPd17sZ98mSwUdxYFd3r9vGmxRN0",
  authDomain: "intelliparse-auth.firebaseapp.com",
  projectId: "intelliparse-auth",
  storageBucket: "intelliparse-auth.firebasestorage.app",
  messagingSenderId: "953216920649",
  appId: "1:953216920649:web:fc915ac583f2b49838e398",
  measurementId: "G-ZBNZLJZC9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);