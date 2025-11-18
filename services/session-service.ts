import { adminDb } from "@/lib/firebase-admin";
import { SessionDoc, SessionVersionDoc } from "@/types/database";
import { SESSIONS_COLLECTION } from "@/utils/constants";
import { SESSION_VERSIONS_COLLECTION } from "@/utils/constants";
import {
  getDocumentDataFromQuerySnapshot,
  getIDAndDocumentDataFromDocumentSnapshot,
} from "@/utils/firebase-queries";

export class SessionService {
  static async getSessions(): Promise<SessionDoc[]> {
    const sessionsSnapshot = await adminDb.collection(SESSIONS_COLLECTION).get();
    return getDocumentDataFromQuerySnapshot<SessionDoc>(sessionsSnapshot);
  }

  static async getSession(sessionID: string): Promise<SessionDoc | null> {
    const sessionDoc = await adminDb.collection(SESSIONS_COLLECTION).doc(sessionID).get();
    return getIDAndDocumentDataFromDocumentSnapshot<SessionDoc>(sessionDoc) || null;
  }

  static async getSessionVersions(): Promise<SessionVersionDoc[]> {
    const versionsSnapshot = await adminDb.collection(SESSION_VERSIONS_COLLECTION).get();
    return getDocumentDataFromQuerySnapshot<SessionVersionDoc>(versionsSnapshot);
  }

  static async getSessionVersion(
    sessionID: string,
    versionID: string,
  ): Promise<SessionVersionDoc | null> {
    const versionDoc = await adminDb.collection(SESSION_VERSIONS_COLLECTION).doc(versionID).get();
    return getIDAndDocumentDataFromDocumentSnapshot<SessionVersionDoc>(versionDoc) || null;
  }
}
