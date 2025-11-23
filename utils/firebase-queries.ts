import { adminDb } from "@/lib/firebase-admin";
import { CollectionReference, DocumentSnapshot, QuerySnapshot } from "firebase-admin/firestore";

export async function getDocumentDataFromQuerySnapshot<T>(snapshot: QuerySnapshot): Promise<T[]> {
  return snapshot.docs.map((doc) => doc.data() as T);
}

export function getIDAndDocumentDataFromDocumentSnapshot<T>(
  snapshot: DocumentSnapshot,
): (T & { id: string }) | null {
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
}

/**
 * Retrieves all documents from a specified Firestore collection, including their IDs.
 *
 * @template T - The type of the document data.
 * @param {CollectionReference<T>} collection - The Firestore collection reference.
 * @returns {Promise<(T & { id: string })[]>} A promise that resolves to an array of documents, each augmented with its ID.
 */
export async function getDocumentDataFromCollection<T>(
  collection: CollectionReference<T>,
): Promise<(T & { id: string })[]> {
  const snapshot = await collection.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as T) }));
}

/**
 * Retrieves a single document by its ID from a specified Firestore collection, including its ID.
 *
 * @template T - The type of the document data.
 * @param {CollectionReference<T>} collection - The Firestore collection reference.
 * @param {string} documentId - The ID of the document to retrieve.
 * @returns {Promise<(T & { id: string }) | null>} A promise that resolves to the document data, augmented with its ID, or null if the document does not exist.
 */
export async function getDocumentDataFromCollectionById<T>(
  collection: string,
  documentId: string,
): Promise<(T & { id: string }) | null> {
  const snapshot = await adminDb.collection(collection).doc(documentId).get();
  return getIDAndDocumentDataFromDocumentSnapshot<T>(snapshot as DocumentSnapshot);
}
