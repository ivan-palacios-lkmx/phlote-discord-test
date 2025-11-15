import { DocumentSnapshot, QuerySnapshot } from "firebase-admin/firestore";

export async function getDocumentDataFromQuerySnapshot<T>(snapshot: QuerySnapshot): Promise<T[]> {
  return snapshot.docs.map((doc) => doc.data() as T);
}

export async function getDocumentDataFromDocumentSnapshot<T>(
  snapshot: DocumentSnapshot,
): Promise<T | null> {
  return snapshot.data() as T | null;
}
