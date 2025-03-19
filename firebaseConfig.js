import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWkiHRCXzlVGelCh_ZJp4r-7wyDGiXqpA",
  authDomain: "fff-app-777.firebaseapp.com",
  projectId: "fff-app-777",
  storageBucket: "fff-app-777.appspot.com", // Fixed storage URL
  messagingSenderId: "836620654068",
  appId: "1:836620654068:web:68a2ddf6a39c5e0485d5a1",
  measurementId: "G-7TWCHWRWWY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ✅ Added authentication
const analytics = getAnalytics(app);

export { auth }; // ✅ Export auth so you can use it in Login & Signup screens
