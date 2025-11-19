import { adminDb } from "@/lib/firebase-admin";
import { ActivityDocWithID, SessionDoc, SessionVersionDocWithID } from "@/types/database";
import { ACTIVITY_COLLECTION, SESSIONS_COLLECTION } from "@/utils/constants";
import { SESSION_VERSIONS_COLLECTION } from "@/utils/constants";
import {
  getDocumentDataFromQuerySnapshot,
  getIDAndDocumentDataFromDocumentSnapshot,
} from "@/utils/firebase-queries";
import { DocumentReference } from "firebase-admin/firestore";

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

  static async getSessionVersion(versionID: string): Promise<SessionVersionDocWithID | null> {
    const versionDoc = await adminDb.collection(SESSION_VERSIONS_COLLECTION).doc(versionID).get();
    return getIDAndDocumentDataFromDocumentSnapshot<SessionVersionDocWithID>(versionDoc) || null;
  }

  static async getSessionActivity(
    sessionID: string,
    limit: number = 60,
  ): Promise<ActivityDocWithID[]> {
    const activitySnapshot = await adminDb
      .collection(ACTIVITY_COLLECTION)
      .where("sessionID", "==", sessionID)
      .orderBy("__name__", "desc")
      .limit(limit)
      .get();
    return getDocumentDataFromQuerySnapshot<ActivityDocWithID>(activitySnapshot);
  }

  static async registerSessionActivity(
    sessionID: string,
    versionID: string,
    type: "PLAY" | "DOWNLOAD",
    initiator: string,
  ): Promise<DocumentReference> {
    const activity = await adminDb.collection(ACTIVITY_COLLECTION).add({
      sessionID,
      versionID,
      type,
      initiator,
      created: new Date(),
    });
    return activity;
  }

  static async getVersionActivity(
    versionID: string,
    limit: number = 60,
  ): Promise<ActivityDocWithID[]> {
    const activitySnapshot = await adminDb
      .collection(ACTIVITY_COLLECTION)
      .where("versionID", "==", versionID)
      .orderBy("__name__", "desc")
      .limit(limit)
      .get();
    return getDocumentDataFromQuerySnapshot<ActivityDocWithID>(activitySnapshot);
  }
}
