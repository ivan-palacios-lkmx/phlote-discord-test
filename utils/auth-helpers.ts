import { adminDb } from "@/lib/firebase-admin";
import checkAddressDefault from "@/utils/checkAddress";

/**
 * Creates a signature message for wallet authentication
 * @param nonce - The nonce to include in the message
 * @returns The message to be signed
 */
export function createSigMessage(nonce: string): string {
  return `Welcome to Phlote.\n\nApprove this message to securely log in.\n\nnonce: ${nonce}`;
}

// Re-export checkAddress as named export for convenience
export const checkAddress = checkAddressDefault;

/**
 * Cleans expired nonces from Firestore
 */
export async function cleanNonces(): Promise<void> {
  const db = adminDb;

  // Pull expired nonces
  const qSnap = await db.collection("nonces").where("expires", "<", new Date()).limit(200).get();

  // Loop and delete any nonces
  if (!qSnap.empty) {
    const batch = db.batch();
    qSnap.forEach((snap) => {
      batch.delete(snap.ref);
    });
    await batch.commit();
    console.log(`${qSnap.docs.length} expired nonces deleted.`);
  } else {
    console.log("No expired nonces to delete.");
  }
}
