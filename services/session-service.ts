import { adminDb } from "@/lib/firebase-admin";
import admin from "@/lib/firebase-admin";
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
import { DocumentReference, FieldValue, Transaction } from "firebase-admin/firestore";
import kebabCase from "lodash/kebabCase";
import querystring from "querystring";
import ShortUniqueId from "short-unique-id";

import { DiscordService } from "./discord-service";

export class SessionService {
  static async deleteVersion(versionId: string): Promise<void> {
    await adminDb.collection(SESSION_VERSIONS_COLLECTION).doc(versionId).delete();
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await adminDb.collection(SESSIONS_COLLECTION).doc(sessionId).delete();
  }

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
        sourceVersion: versionDetails.sourceVersion,
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

      if (session.discordChannelId) {
        await this.sendVersionCreationMessage(
          sessionID,
          session.name,
          versionDetails.creator,
          session.discordChannelId,
          newVersionIndex,
        );
      }

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
    initiator?: string,
    type?: "PLAY" | "DOWNLOAD",
  ): Promise<ActivityDocWithID[]> {
    let query = adminDb
      .collection(ACTIVITY_COLLECTION)
      .where("sessionID", "==", sessionID)
      .orderBy("created", "desc")
      .limit(limit);

    if (initiator) {
      query = query.where("initiator", "==", initiator);
    }

    if (type) {
      query = query.where("type", "==", type);
    }

    const activitySnapshot = await query.get();
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
    if (type === "PLAY") {
      await adminDb
        .collection(SESSION_VERSIONS_COLLECTION)
        .doc(versionID)
        .update({
          playCount: FieldValue.increment(1),
        });
    } else if (type === "DOWNLOAD") {
      await adminDb
        .collection(SESSION_VERSIONS_COLLECTION)
        .doc(versionID)
        .update({
          downloadCount: FieldValue.increment(1),
        });
    }
    return activity;
  }

  static async getVersionActivity(
    versionID: string,
    limit: number = 60,
  ): Promise<ActivityDocWithID[]> {
    const activitySnapshot = await adminDb
      .collection(ACTIVITY_COLLECTION)
      .where("versionID", "==", versionID)
      .orderBy("created", "desc")
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

    await this.createSessionDiscordChannel(sessionId, sessionDetails.name, sessionDetails.creator);

    return {
      sessionId,
      versionId,
    };
  }

  static async createSessionDiscordChannel(
    sessionId: string,
    sessionName: string,
    creator: string,
  ) {
    try {
      const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;
      const guildId = process.env.DISCORD_GUILD_ID;

      if (!token || !guildId) {
        console.warn("Discord token or guild ID not configured, skipping channel creation");
        return;
      }

      DiscordService.initialize(token);

      const channelName = kebabCase(sessionName);
      const channel = await DiscordService.createChannel(guildId, channelName);

      await this.updateSessionDiscordChannel(sessionId, channel.id);

      await this.sendSessionCreationMessage(sessionId, sessionName, creator, channel.id);
    } catch (error) {
      console.error("Error creating Discord channel for session:", error);
      // We don't throw here to avoid failing the session creation if Discord fails
    }
  }

  static async sendSessionCreationMessage(
    sessionId: string,
    sessionName: string,
    creator: string,
    channelId: string,
  ) {
    await this.sendVersionCreationMessage(sessionId, sessionName, creator, channelId, 1);
  }

  static async sendVersionCreationMessage(
    sessionId: string,
    sessionName: string,
    creator: string,
    channelId: string,
    versionIndex: number,
  ) {
    try {
      const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;

      if (token) {
        DiscordService.initialize(token);
      }

      // Ensure URL is well-formed
      const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

      const versionLink = `${baseUrl}/sessions/${sessionId}?v=${versionIndex}`;
      const postImage = await this.getSessionPostImage(sessionId);
      const formattedVIndex = `V_${String(versionIndex).padStart(3, "0")}`;
      const creatorName = await this.getAddressName(creator);
      const content = `New version \`${formattedVIndex}\` created by ${creatorName}`;
      await DiscordService.sendMessageToChannel(channelId, content, {
        embeds: [
          {
            image: {
              url: postImage,
            },
          },
        ],
        components: [
          {
            type: 1, // Action Row
            components: [
              {
                type: 2,
                label: "Listen on Phlote",
                style: 5,
                url: versionLink,
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error sending session creation message to Discord:", error);
    }
  }

  static async getSessionPostImage(sessionId: string): Promise<string> {
    const frontendURL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://phlote.co";

    const defaultImage = `${frontendURL}/images/phlote-poster.jpg`;

    try {
      // 1. Check if session already has an ogImage
      const sessionDoc = await adminDb.collection(SESSIONS_COLLECTION).doc(sessionId).get();

      if (!sessionDoc.exists) return defaultImage;

      const sessionData = sessionDoc.data();
      if (sessionData?.ogImage) return sessionData.ogImage;

      // 2. Gather Data
      const creatorName = await this.getAddressName(sessionData?.creator);
      const creatorImage = await this.getAddressImage(sessionData?.creator);

      // Get latest version for this session to get bounce hash
      const versions = await this.getSessionVersions(sessionId);
      const latestVersion = versions.length > 0 ? versions[versions.length - 1] : null;

      // Ensure collaborators is an array (legacy support)
      let collaborators = sessionData?.collaborators || [];
      if (!Array.isArray(collaborators)) {
        collaborators = [collaborators];
      }
      const count = collaborators.length;

      // Limit to first 4 avatars to avoid URL length issues
      const avatarsToFetch = (collaborators as string[]).slice(0, 4);
      const avatars = await Promise.all(avatarsToFetch.map((addr) => this.getAddressImage(addr)));

      // 3. Build URL
      const ogParams = {
        artist: creatorName,
        song: sessionData?.name || "",
        bgImage: creatorImage || defaultImage,
        avatars: avatars.map((url) => url || defaultImage),
        count: count,
        hash: latestVersion?.bounce || "",
      };

      const publicUrl = `${frontendURL}/api/og?${querystring.stringify(ogParams)}`;

      // 4. Update Session with the dynamic URL
      // We save this URL so we don't have to re-compute params every time
      await adminDb.collection(SESSIONS_COLLECTION).doc(sessionId).update({
        ogImage: publicUrl,
        imageUpdated: new Date(),
      });

      return publicUrl;
    } catch (error) {
      console.error("Error generating session OG image:", error);
      return defaultImage;
    }
  }

  // Helper methods for OG Image generation
  private static async getAddressName(address: string | undefined): Promise<string> {
    if (!address) return "";
    const db = adminDb;
    const addressDoc = await db.collection("addresses").doc(address).get();

    if (!addressDoc.exists) {
      const cleanAddress = address.trim();
      return `${cleanAddress.substring(0, 6)}...${cleanAddress.substring(cleanAddress.length - 4)}`;
    }

    const docData = addressDoc.data();
    const ens = docData?.ens?.name;
    const zora = docData?.zora?.zoraUsername;
    const os = docData?.openSea?.osUsername;

    return (
      ens || os || zora || `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    );
  }

  private static async getAddressImage(address: string | undefined): Promise<string> {
    if (!address) return "";
    const db = adminDb;
    const addressDoc = await db.collection("addresses").doc(address).get();

    if (!addressDoc.exists) return "";

    const docData = addressDoc.data();
    return (
      docData?.ensImageURL ||
      docData?.openSea?.profileImageURL ||
      docData?.zora?.profileImageURL ||
      ""
    );
  }

  static async updateSessionDiscordChannel(sessionId: string, discordChannelId: string) {
    try {
      const sessionRef = await this.getSessionReference(sessionId);
      await sessionRef.update({ discordChannelId });
    } catch (error) {
      console.error("Error updating session with Discord channel ID:", error);
    }
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
      collaborators: [sessionDetails.creator],
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
      collaborators: [sessionDetails.creator],
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
