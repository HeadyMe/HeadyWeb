import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config — HeadyWeb project
// TODO: Replace with actual Firebase project credentials when created
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyHeadyWeb-placeholder',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'headyweb.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'headyweb',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'headyweb.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID || '000000000000',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:placeholder',
};

let app, auth, db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (e) {
    console.warn('[HeadyWeb] Firebase not configured — running in demo mode:', e.message);
}

const googleProvider = new GoogleAuthProvider();

export async function signInGoogle() {
    if (!auth) return { error: 'Firebase not configured' };
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await saveUserProfile(result.user);
        return { user: result.user };
    } catch (e) {
        return { error: e.message };
    }
}

export async function signInEmail(email, password) {
    if (!auth) return { error: 'Firebase not configured' };
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user };
    } catch (e) {
        return { error: e.message };
    }
}

export async function signUpEmail(email, password) {
    if (!auth) return { error: 'Firebase not configured' };
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserProfile(result.user);
        return { user: result.user };
    } catch (e) {
        return { error: e.message };
    }
}

export async function logOut() {
    if (!auth) return;
    await signOut(auth);
}

export function onAuthChange(callback) {
    if (!auth) { callback(null); return () => { }; }
    return onAuthStateChanged(auth, callback);
}

async function saveUserProfile(user) {
    if (!db || !user) return;
    try {
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            plan: 'free',
            searchCount: 0,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            source: 'headyweb-browser',
        }, { merge: true });
    } catch (e) {
        console.warn('[HeadyWeb] Could not save profile:', e.message);
    }
}

export async function logSearch(userId, query) {
    if (!db) return;
    try {
        await addDoc(collection(db, 'searches'), {
            userId: userId || 'anonymous',
            query,
            timestamp: serverTimestamp(),
            source: 'headyweb-search',
        });
    } catch (e) {
        // Silent fail — analytics shouldn't break UX
    }
}

export async function getUserPlan(userId) {
    if (!db || !userId) return 'free';
    try {
        const snap = await getDoc(doc(db, 'users', userId));
        return snap.exists() ? (snap.data().plan || 'free') : 'free';
    } catch {
        return 'free';
    }
}

export { auth, db };
