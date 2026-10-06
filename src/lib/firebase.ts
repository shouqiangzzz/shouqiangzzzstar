import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer,
  setDoc, 
  getDocs, 
  collection, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { getStorage } from 'firebase/storage';
import { handleFirestoreError, OperationType } from './firestoreError';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim() || firebaseConfig.apiKey;
export const hasFirebaseApiKey = Boolean(apiKey && !/^\*+$/.test(apiKey) && apiKey !== 'YOUR_FIREBASE_WEB_API_KEY');
const app = initializeApp({ ...firebaseConfig, apiKey });
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Connection check mandated by Firebase Skill
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or network status.");
    }
    return false;
  }
}

export { 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  orderBy,
  onSnapshot,
  handleFirestoreError,
  OperationType
};
export type { FirebaseUser };
