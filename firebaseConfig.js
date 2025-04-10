import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWkiHRCXzlVGelCh_ZJp4r-7wyDGiXqpA",
  authDomain: "fff-app-777.firebaseapp.com",
  projectId: "fff-app-777",
  storageBucket: "fff-app-777.appspot.com",
  messagingSenderId: "836620654068",
  appId: "1:836620654068:web:68a2ddf6a39c5e0485d5a1",
  measurementId: "G-7TWCHWRWWY",
};

// Initialize Firebase app
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics };
