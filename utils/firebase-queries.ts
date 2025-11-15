import { QuerySnapshot } from "firebase-admin/firestore";

export async function getDocumentDataFromQuerySnapshot<T>(snapshot: QuerySnapshot): Promise<T[]> {
  return snapshot.docs.map((doc) => doc.data() as T);
}
