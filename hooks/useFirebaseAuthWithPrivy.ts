import { auth } from "@/lib/firebase";
import { usePrivy } from "@privy-io/react-auth";
import { signInWithCustomToken } from "firebase/auth";
import { useEffect, useState } from "react";

/**
 * Hook to handle Firebase authentication after Privy login
 *
 * Flow:
 * 1. User logs in with Privy
 * 2. Get wallet address from Privy
 * 3. Request Firebase token from /api/authCreateToken (using only address for now)
 * 4. Sign in to Firebase with custom token
 *
 * TODO: Once we implement nonce UI flow, we should:
 * - Request nonce from /api/authCreateNonce
 * - Show message to user and have them sign it
 * - Pass message and signature to /api/authCreateToken for verification
 */
export function useFirebaseAuthWithPrivy() {
  const { user, authenticated, ready } = usePrivy();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function authenticateWithFirebase() {
      // Wait for Privy to be ready
      if (!ready || !authenticated || !user) {
        return;
      }

      // Find wallet account
      const walletAccount = user.linkedAccounts?.find((acc) => acc.type === "wallet");
      if (!walletAccount || !("address" in walletAccount)) {
        return;
      }

      const address = walletAccount.address as string;
      if (!address) {
        return;
      }

      // Check if already authenticated with Firebase
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === address.toLowerCase()) {
        return; // Already authenticated
      }

      setIsAuthenticating(true);
      setError(null);

      try {
        // TODO: Once we implement nonce UI flow, we should:
        // 1. Request nonce from /api/authCreateNonce
        // 2. Show message to user and have them sign it
        // 3. Pass message and signature to /api/authCreateToken

        // For now, we just request the token using the wallet address
        // The backend trusts that Privy has already verified wallet ownership
        const tokenResponse = await fetch(
          `/api/authCreateToken?address=${encodeURIComponent(address)}`,
        );
        const tokenData = await tokenResponse.json();

        if (!tokenData.success || !tokenData.token) {
          throw new Error("Failed to get Firebase token");
        }

        // Sign in to Firebase
        await signInWithCustomToken(auth, tokenData.token);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Firebase authentication error:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsAuthenticating(false);
      }
    }

    authenticateWithFirebase();
  }, [ready, authenticated, user]);

  return {
    isAuthenticating,
    error,
  };
}
