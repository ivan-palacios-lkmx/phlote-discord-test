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

export function getDocumentDataFromCollection<T>(
  collection: CollectionReference<T>,
): Promise<(T & { id: string }) | null> {
  const snapshot = collection.doc().get();
  const documentData = getIDAndDocumentDataFromDocumentSnapshot(snapshot);
  return documentData;
}
