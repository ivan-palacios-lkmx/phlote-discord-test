import { adminDb } from "@/lib/firebase-admin";
import { SessionDetails } from "@/types/api";
import {
  ActivityDocWithID,
  SessionDoc,
  VersionDetails,
  VersionDoc,
  VersionDocWithID,
} from "@/types/database";
import { ACTIVITY_COLLECTION, SESSIONS_COLLECTION } from "@/utils/constants";
import { SESSION_VERSIONS_COLLECTION } from "@/utils/constants";
import {
  getDocumentDataFromQuerySnapshot,
  getIDAndDocumentDataFromDocumentSnapshot,
} from "@/utils/firebase-queries";
import { formatProjectId } from "@/utils/functions";
import { DocumentReference, Transaction } from "firebase-admin/firestore";
import { serverTimestamp } from "firebase/firestore";
import ShortUniqueId from "short-unique-id";

export class SessionService {
  static async getSessions(): Promise<SessionDoc[]> {
    const sessionsSnapshot = await adminDb.collection(SESSIONS_COLLECTION).get();
    return getDocumentDataFromQuerySnapshot<SessionDoc>(sessionsSnapshot);
  }

  static async getSession(sessionID: string): Promise<SessionDoc | null> {
    const sessionDoc = await adminDb.collection(SESSIONS_COLLECTION).doc(sessionID).get();
    return getIDAndDocumentDataFromDocumentSnapshot<SessionDoc>(sessionDoc) || null;
  }

  static async getSessionVersions(sessionID: string): Promise<VersionDocWithID[]> {
    const versionsSnapshot = await adminDb
      .collection(SESSION_VERSIONS_COLLECTION)
      .where("sessionID", "==", sessionID)
      .get();
    return getDocumentDataFromQuerySnapshot<VersionDocWithID>(versionsSnapshot);
  }

  // Versions Logic
  static async getVersion(versionID: string): Promise<VersionDocWithID | null> {
    const versionDoc = await adminDb.collection(SESSION_VERSIONS_COLLECTION).doc(versionID).get();
    return getIDAndDocumentDataFromDocumentSnapshot<VersionDocWithID>(versionDoc) || null;
  }

  static async createVersion(
    sessionID: string,
    versionDetails: VersionDetails,
  ): Promise<VersionDocWithID | null> {
    const versionId = await this.createProjectId("version");

    const newVersion: VersionDoc = {
      ...versionDetails,
      sessionID,
      created: serverTimestamp(),
    };

    await adminDb.collection(SESSION_VERSIONS_COLLECTION).doc(versionId).set(newVersion);

    return { id: versionId, ...newVersion };
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

  static async createSession(
    sessionDetails: SessionDetails,
  ): Promise<{ sessionId: string; versionId: string }> {
    const sessionId = await this.createProjectId("session");
    const versionId = await this.createProjectId("version");

    await adminDb.runTransaction(async (transaction) => {
      this.createSessionDocumentForTransaction(transaction, sessionId, sessionDetails);
      this.createVersionDocumentForTransaction(transaction, versionId, sessionId, sessionDetails);
    });

    return {
      sessionId,
      versionId,
    };
  }

  private static createSessionDocumentForTransaction(
    transaction: Transaction,
    sessionId: string,
    sessionDetails: SessionDetails,
  ): void {
    const sessionRef = adminDb.collection(SESSIONS_COLLECTION).doc(sessionId);
    transaction.set(sessionRef, {
      created: new Date(),
      creator: sessionDetails.creator,
      name: sessionDetails.name,
    });
  }

  // This method is used to create the first version of a session in a transaction.
  private static createVersionDocumentForTransaction(
    transaction: Transaction,
    versionId: string,
    sessionId: string,
    sessionDetails: SessionDetails,
  ): void {
    const versionRef = adminDb.collection(SESSION_VERSIONS_COLLECTION).doc(versionId);
    transaction.set(versionRef, {
      created: new Date(),
      creator: sessionDetails.creator,
      sessionID: sessionId,
      bounce: sessionDetails.bounce,
      stems: sessionDetails.stems,
      notes: sessionDetails.notes,
      tags: sessionDetails.tags,
      bpm: sessionDetails.bpm,
    });
  }

  static async createProjectId(projectType: "session" | "version"): Promise<string> {
    const MAX_ID_CREATION_ATTEMPTS = 10;

    const collection =
      projectType === "session" ? SESSIONS_COLLECTION : SESSION_VERSIONS_COLLECTION;

    for (let i = 0; i < MAX_ID_CREATION_ATTEMPTS; i++) {
      const projectId = new ShortUniqueId({
        dictionary: "alpha_lower",
        length: 10,
      });

      const formattedProjectId = formatProjectId(projectId);

      const projectIdDoc = await adminDb.collection(collection).doc(formattedProjectId).get();

      if (!projectIdDoc.exists) {
        return formattedProjectId;
      }
    }
    throw new Error("Failed to create track ID");
  }

  static async getSessionReference(sessionId: string): Promise<DocumentReference> {
    return adminDb.collection(SESSIONS_COLLECTION).doc(sessionId);
  }

  static async getVersionReference(versionId: string): Promise<DocumentReference> {
    return adminDb.collection(SESSION_VERSIONS_COLLECTION).doc(versionId);
  }

  // In the legacy app, the session name was the only field that could be updated.
  static async updateSessionName(sessionId: string, name: string): Promise<{ success: boolean }> {
    try {
      const sessionRef = await this.getSessionReference(sessionId);
      await sessionRef.update({ name });
      return { success: true };
    } catch (error) {
      console.error("Error updating session:", error);
      return { success: false };
    }
  }

  static async updateVersionTags(versionId: string, tags: string[]): Promise<{ success: boolean }> {
    try {
      const versionRef = await this.getVersionReference(versionId);
      await versionRef.update({ tags });
      return { success: true };
    } catch (error) {
      console.error("Error updating version tags:", error);
      return { success: false };
    }
  }

  static async updateVersionNotes(versionId: string, notes: string): Promise<{ success: boolean }> {
    try {
      const versionRef = await this.getVersionReference(versionId);
      await versionRef.update({ notes });
      return { success: true };
    } catch (error) {
      console.error("Error updating version notes:", error);
      return { success: false };
    }
  }
}
