import { initializeApp } from 'firebase/app';
//@ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase pour Skillsy
const firebaseConfig = {
    apiKey: "AIzaSyDC78OEpgpIUDwIPBvx3trzz7-LOl7jrBI",
    authDomain: "skillsy-3e82c.firebaseapp.com",
    projectId: "skillsy-3e82c",
    storageBucket: "skillsy-3e82c.firebasestorage.app",
    messagingSenderId: "308094561690",
    appId: "1:308094561690:android:6bca2486246c7047e2de23"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Auth avec persistance pour React Native
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialiser Firestore
export const db = getFirestore(app);

// Initialiser Storage
export const storage = getStorage(app);

export default app;
