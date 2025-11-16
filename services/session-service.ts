import { adminDb } from "@/lib/firebase-admin";
import { SessionDoc } from "@/types/database";
import { SESSIONS_COLLECTION } from "@/utils/constants";
import {
  getDocumentDataFromDocumentSnapshot,
  getDocumentDataFromQuerySnapshot,
} from "@/utils/firebase-queries";

export class SessionService {
  static async getSessions(): Promise<SessionDoc[]> {
    const sessionsSnapshot = await adminDb.collection(SESSIONS_COLLECTION).get();
    return getDocumentDataFromQuerySnapshot<SessionDoc>(sessionsSnapshot);
  }

  static async getSession(sessionID: string): Promise<SessionDoc | null> {
    const sessionDoc = await adminDb.collection(SESSIONS_COLLECTION).doc(sessionID).get();
    return getDocumentDataFromDocumentSnapshot<SessionDoc>(sessionDoc) || null;
  }
}
