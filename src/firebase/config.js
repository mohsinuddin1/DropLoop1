import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAgkH7JbHBy01QI3DWmBy213Pynk4egSa8",
    authDomain: "droploop-1b7ff.firebaseapp.com",
    databaseURL: "https://droploop-1b7ff-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "droploop-1b7ff",
    storageBucket: "droploop-1b7ff.firebasestorage.app",
    messagingSenderId: "311490534810",
    appId: "1:311490534810:web:fc9812d2a3897c96acae23",
    measurementId: "G-BFCKMN1D1N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
