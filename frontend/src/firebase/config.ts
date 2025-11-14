import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

// Replace these with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAxXb1GEmuAtRYZASwrcs6NOoxXq14kaKI",
  authDomain: "surakshanet-bfcc3.firebaseapp.com",
  projectId: "surakshanet-bfcc3",
  storageBucket: "surakshanet-bfcc3.appspot.com",
  messagingSenderId: "454391081115",
  appId: "1:454391081115:web:58259f2f4ac35edaf13e3e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email/password", error);
    throw error;
  }
};

export const registerWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error registering with email/password", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};