import { adminDb } from "@/lib/firebase-admin";
import { SessionDoc, SessionVersionDoc, SessionVersionDocWithID } from "@/types/database";
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

  static async getSessionVersions(sessionID: string): Promise<SessionVersionDocWithID[]> {
    const versionsSnapshot = await adminDb
      .collection(SESSION_VERSIONS_COLLECTION)
      .where("sessionID", "==", sessionID)
      .get();
    return getDocumentDataFromQuerySnapshot<SessionVersionDocWithID>(versionsSnapshot);
  }

  static async getSessionVersion(
    sessionID: string,
    versionID: string,
  ): Promise<SessionVersionDocWithID | undefined> {
    const AllSessionVersions = await this.getSessionVersions(sessionID);
    const specificVersion = AllSessionVersions.find((version) => version.id === versionID);
    return specificVersion;
  }
}
