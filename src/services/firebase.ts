import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Retrieve Firebase credentials from Expo-compatible environment variables
const firebaseConfig = {
  apiKey: import.meta.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
    import.meta.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID &&
    !import.meta.env.EXPO_PUBLIC_FIREBASE_API_KEY.includes('YourFirebaseApiKey')
);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization error:', err);
  }
}

export { app, auth, db };

export const authService = {
  async loginWithEmail(email: string, pass: string) {
    if (!isFirebaseConfigured || !auth) {
      // Fallback mock delay for seamless initial preview/testing
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (email.includes('error')) {
        throw new Error('Invalid email or password');
      }
      return { user: { uid: 'user_tyrell', email } };
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential;
  },

  async signUpWithEmail(email: string, pass: string, name: string) {
    if (!isFirebaseConfigured || !auth) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { user: { uid: `user_${Date.now()}`, email, displayName: name } };
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    return userCredential;
  },

  async signOut() {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
  },
};
