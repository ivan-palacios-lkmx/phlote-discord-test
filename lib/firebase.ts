import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);

const shouldUseEmulator = false;
// TODO: Enable this when we have a proper emulator setup
// process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" ||
// (process.env.NODE_ENV === "development" && typeof window !== "undefined");

if (shouldUseEmulator) {
  try {
    connectFirestoreEmulator(db, "localhost", 8081);
  } catch (error) {
    if (error instanceof Error && !error.message.includes("already been initialized")) {
      console.warn("Could not connect to Firestore emulator:", error.message);
    }
  }

  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  } catch (error) {
    if (error instanceof Error && !error.message.includes("already been initialized")) {
      console.warn("Could not connect to Auth emulator:", error.message);
    }
  }
}
