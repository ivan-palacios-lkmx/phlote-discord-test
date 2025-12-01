import { adminDb } from "@/lib/firebase-admin";
import { SessionDetails } from "@/types/api";
import {
  ActivityDocWithID,
  SessionDoc,
  SessionDocWithID,
  VersionDetails,
  VersionDocWithID,
} from "@/types/database";
import { ACTIVITY_COLLECTION, SESSIONS_COLLECTION } from "@/utils/constants";
import { SESSION_VERSIONS_COLLECTION } from "@/utils/constants";
import {
  getDocumentDataFromQuerySnapshot,
  getIDAndDocumentDataFromDocumentSnapshot,
  getIDAndDocumentDataFromQuerySnapshot,
} from "@/utils/firebase-queries";
import { formatProjectId } from "@/utils/functions";
import { DocumentReference, FieldValue, Timestamp, Transaction } from "firebase-admin/firestore";
import ShortUniqueId from "short-unique-id";

import { AudioService } from "./audio-service";

export class SessionService {
  static async getSessions(): Promise<SessionDocWithID[]> {
    const sessionsSnapshot = await adminDb.collection(SESSIONS_COLLECTION).get();
    return getIDAndDocumentDataFromQuerySnapshot<SessionDocWithID>(sessionsSnapshot);
  }

  static async getSession(sessionID: string): Promise<SessionDoc | null> {
    const sessionDoc = await adminDb.collection(SESSIONS_COLLECTION).doc(sessionID).get();
    return getIDAndDocumentDataFromDocumentSnapshot<SessionDoc>(sessionDoc) || null;
  }

  static async getSessionVersions(sessionID: string, index?: number): Promise<VersionDocWithID[]> {
    let query = adminDb
      .collection(SESSION_VERSIONS_COLLECTION)
      .where("sessionID", "==", sessionID)
      .orderBy("created", "asc");

    if (index !== undefined) {
      query = query.offset(index).limit(1);
    }

    const versionsSnapshot = await query.get();
    return getIDAndDocumentDataFromQuerySnapshot<VersionDocWithID>(versionsSnapshot);
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
    try {
      const session = await this.getSession(sessionID);
      if (!session) {
        throw new Error("Session not found");
      }

      const versionId = await this.createProjectId("version");

      const collaborators = await this.getSessionColaborators(versionDetails);

      const newVersionIndex = (session.versionCount || 0) + 1;

      const newVersion: VersionDocWithID = {
        ...versionDetails,
        id: versionId,
        sessionID,
        collaborators,
        created: FieldValue.serverTimestamp(),
        versionIndex: newVersionIndex,
        playCount: 0,
        downloadCount: 0,
      };

      const newMinBpm = session.minBpm
        ? Math.min(session.minBpm, versionDetails.bpm)
        : versionDetails.bpm;
      const newMaxBpm = session.maxBpm
        ? Math.max(session.maxBpm, versionDetails.bpm)
        : versionDetails.bpm;

      await adminDb.runTransaction(async (transaction) => {
        const versionRef = adminDb.collection(SESSION_VERSIONS_COLLECTION).doc(versionId);
        const sessionRef = adminDb.collection(SESSIONS_COLLECTION).doc(sessionID);

        transaction.set(versionRef, newVersion);
        transaction.update(sessionRef, {
          minBpm: newMinBpm,
          maxBpm: newMaxBpm,
          versionCount: newVersionIndex,
          activeLast: FieldValue.serverTimestamp(),
        });
      });

      return newVersion;
    } catch (error) {
      console.error("Error creating version:", error);
      return null;
    }
  }

  static async saveVersionInDatabase(version: VersionDocWithID): Promise<void> {
    await adminDb.collection(SESSION_VERSIONS_COLLECTION).doc(version.id).set(version);
  }

  static async getSessionColaborators(versionDetails: VersionDetails): Promise<string[]> {
    const collaborators: string[] = [];

    collaborators.push(versionDetails.creator);

    const otherVersionsCollaborators =
      await this.getOtherVersionsColaboratorsFromSourceVersion(versionDetails);

    collaborators.push(...otherVersionsCollaborators);

    return collaborators;
  }

  static async getOtherVersionsColaboratorsFromSourceVersion(
    versionDetails: VersionDetails,
  ): Promise<string[]> {
    let isGenesisVersion = false;

    const MAX_VERSIONS_TO_TRAVERSE = 20;

    let currentVersion = versionDetails;

    const extraCollaborators: string[] = [];

    let versionsTraversed = 0;

    while (!isGenesisVersion && versionsTraversed < MAX_VERSIONS_TO_TRAVERSE) {
      if (currentVersion.sourceVersion) {
        const sourceVersion = await this.getVersion(currentVersion.sourceVersion);
        if (sourceVersion) {
          extraCollaborators.push(...sourceVersion.creator);
          currentVersion = sourceVersion;
          versionsTraversed++;
        }
      } else {
        isGenesisVersion = true;
      }
    }

    return extraCollaborators;
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

    // TODO: create discord channel for the session
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
      created: FieldValue.serverTimestamp(),
      creator: sessionDetails.creator,
      name: sessionDetails.name,
      minBpm: sessionDetails.bpm,
      maxBpm: sessionDetails.bpm,
      collaborators: sessionDetails.creator,
      tags: sessionDetails.tags,
      playCount: 0,
      discordMessageCount: 0,
      activeLast: FieldValue.serverTimestamp(),
      versionCount: 1,
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
      created: FieldValue.serverTimestamp(),
      collaborators: sessionDetails.creator,
      creator: sessionDetails.creator,
      downloadCount: 0,
      playCount: 0,
      sessionID: sessionId,
      bounce: sessionDetails.bounce,
      stems: sessionDetails.stems,
      notes: sessionDetails.notes,
      tags: sessionDetails.tags,
      bpm: sessionDetails.bpm,
      versionIndex: 1,
    });
  }

  static async createProjectId(projectType: "session" | "version"): Promise<string> {
    const MAX_ID_CREATION_ATTEMPTS = 10;

    const collection =
      projectType === "session" ? SESSIONS_COLLECTION : SESSION_VERSIONS_COLLECTION;

    for (let i = 0; i < MAX_ID_CREATION_ATTEMPTS; i++) {
      const uid = new ShortUniqueId({
        dictionary: "alpha_lower",
        length: 10,
      });

      const projectId = uid.rnd();
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
