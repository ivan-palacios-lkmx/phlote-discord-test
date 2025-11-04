import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";

/**
 * Hook for Firebase Authentication
 * TODO: Integrate with Privy or implement Firebase Auth
 * @returns Firebase user object
 */
export function useFbAuth() {
  const [user, setUser] = useState<{ uid?: string; getIdToken?: () => Promise<string> } | null>(
    null,
  );

  useEffect(() => {
    // TODO: Implement Firebase Auth integration
    // For now, this is a placeholder
    // You may need to integrate with Privy or use Firebase Auth directly
    const auth = getAuth();
    // const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    //   setUser(firebaseUser);
    // });
    // return () => unsubscribe();
  }, []);

  return {
    user: user ? { value: user } : null,
  };
}
