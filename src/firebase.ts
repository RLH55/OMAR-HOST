import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, sendEmailVerification, onAuthStateChanged, signOut, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection, query, where, updateDoc, deleteDoc, getDocs, orderBy, limit, addDoc, Timestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { sendEmailVerification, onAuthStateChanged, signOut, signInWithPopup, doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection, query, where, updateDoc, deleteDoc, getDocs, orderBy, limit, addDoc, Timestamp };
export type { FirebaseUser };
