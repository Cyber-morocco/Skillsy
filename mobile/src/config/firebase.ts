import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDC78OEpgpIUDwIPBvx3trzz7-LOl7jrBI",
    authDomain: "skillsy-3e82c.firebaseapp.com",
    projectId: "skillsy-3e82c",
    storageBucket: "skillsy-3e82c.firebasestorage.app",
    messagingSenderId: "308094561690",
    appId: "1:308094561690:android:6bca2486246c7047e2de23"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} catch (error: unknown) {
    if ((error as { code?: string }).code === 'auth/already-initialized') {
        auth = getAuth(app);
    } else {
        throw error;
    }
}
export { auth };

export const db = getFirestore(app);

export const storage = getStorage(app);

export default app;
