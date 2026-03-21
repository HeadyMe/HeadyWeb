import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config — requires env vars. No hardcoded fallbacks.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app, auth, db;

if (hasConfig) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (e) {
        console.warn('[HeadyWeb] Firebase init failed:', e.message);
    }
} else {
    console.info('[HeadyWeb] Firebase env vars not set — running in demo mode.');
}

/** True when Firebase is properly configured and initialized */
export const isFirebaseConfigured = Boolean(auth);

const googleProvider = auth ? new GoogleAuthProvider() : null;

export async function signInGoogle() {
    if (!auth) return { error: 'Auth unavailable — running in demo mode' };
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await saveUserProfile(result.user);
        return { user: result.user };
    } catch (e) {
        return { error: e.message };
    }
}

export async function signInEmail(email, password) {
    if (!auth) return { error: 'Auth unavailable — running in demo mode' };
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user };
    } catch (e) {
        return { error: e.message };
    }
}

export async function signUpEmail(email, password) {
    if (!auth) return { error: 'Auth unavailable — running in demo mode' };
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
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = {
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            plan: 'free',
            lastLogin: serverTimestamp(),
            source: 'headyweb-browser',
        };
        if (!snap.exists()) {
            data.createdAt = serverTimestamp();
            data.searchCount = 0;
        }
        await setDoc(ref, data, { merge: true });
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
