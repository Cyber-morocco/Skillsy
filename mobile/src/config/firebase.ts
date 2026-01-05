import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
//@ts-ignore - getReactNativePersistence is not in the types but exists at runtime
import { getReactNativePersistence } from 'firebase/auth';
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

// Initialiser Firebase - check if already initialized to prevent errors during hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialiser Auth avec persistance pour React Native
// Use getAuth if already initialized, otherwise initializeAuth
let auth: Auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} catch (error: unknown) {
    // Auth already initialized, get the existing instance
    if ((error as { code?: string }).code === 'auth/already-initialized') {
        auth = getAuth(app);
    } else {
        throw error;
    }
}
export { auth };

// Initialiser Firestore
export const db = getFirestore(app);

// Initialiser Storage
export const storage = getStorage(app);

export default app;
