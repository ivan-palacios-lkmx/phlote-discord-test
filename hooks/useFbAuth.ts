import { auth, db } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";
import { browserLocalPersistence, onAuthStateChanged, setPersistence } from "firebase/auth";
import { signOut as firebaseSignOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";

let persistenceIsSet = false;

/**
 * Hook for Firebase Authentication
 * Equivalent to Vue's useFbAuth composable
 *
 * @returns Object containing:
 * - isAuthenticated: boolean indicating if user is authenticated
 * - loadingUser: boolean indicating if user data is loading
 * - signOut: function to sign out the user
 * - auth: Firebase Auth instance
 * - userDoc: User document data from Firestore
 * - user: Firebase User object
 */
export function useFbAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<Record<string, unknown> | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const unwatchUserDocRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Set persistence once
    if (!persistenceIsSet) {
      setPersistence(auth, browserLocalPersistence).then(() => {
        persistenceIsSet = true;
      });
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (incomingUser) => {
      setUser(incomingUser);

      // Unsubscribe from previous user doc listener
      if (unwatchUserDocRef.current) {
        unwatchUserDocRef.current();
        unwatchUserDocRef.current = null;
      }

      if (incomingUser?.uid) {
        // Subscribe to user document changes
        const userDocRef = doc(db, `addresses/${incomingUser.uid}`);
        const unsubscribeUserDoc = onSnapshot(
          userDocRef,
          (userSnap) => {
            setUserDoc(userSnap.data() || null);
            setLoadingUser(false);
          },
          (error) => {
            console.error("Error fetching user document:", error);
            setUserDoc(null);
            setLoadingUser(false);
          },
        );

        unwatchUserDocRef.current = unsubscribeUserDoc;
      } else {
        setUserDoc(null);
        setLoadingUser(false);
      }
    });

    // Cleanup function
    return () => {
      unsubscribe();
      if (unwatchUserDocRef.current) {
        unwatchUserDocRef.current();
        unwatchUserDocRef.current = null;
      }
    };
  }, []);

  // Helper - is authed
  const isAuthenticated = useMemo(() => !loadingUser && !!user?.uid, [loadingUser, user]);

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  return {
    isAuthenticated,
    loadingUser,
    signOut,
    auth,
    userDoc,
    user: user ? { value: user } : null,
  };
}
