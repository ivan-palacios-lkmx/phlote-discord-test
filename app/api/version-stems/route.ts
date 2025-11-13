import { adminAuth, adminDb } from "@/lib/firebase-admin";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/version-stems?versionID=xxx&action=play
 *
 * Fetches version stems for a given version ID
 * Requires authentication for download action or if version is not public
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const versionID = searchParams.get("versionID");
    const action = searchParams.get("action") || "play";

    if (!versionID) {
      return NextResponse.json(
        { success: false, errorMessage: "versionID parameter is required" },
        { status: 400 },
      );
    }

    // Validate action
    if (!["play", "download"].includes(action)) {
      return NextResponse.json(
        { success: false, errorMessage: "Unrecognized action" },
        { status: 400 },
      );
    }

    // Get user ID from authorization header
    const authHeader = request.headers.get("authorization");
    let userID: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(token);
        userID = decodedToken.uid;
      } catch (error) {
        // Invalid token, userID will remain null
        console.error("Error verifying token:", error);
      }
    }

    // Get version data
    const versionSnap = await adminDb.doc(`session-versions/${versionID}`).get();
    const versionData = versionSnap.data();

    // Validate version has bounce and stems
    if (!versionData?.bounce || !versionData?.stems) {
      return NextResponse.json(
        { success: false, errorMessage: "Unable to get version data." },
        { status: 400 },
      );
    }

    // If we have a user, verify they are a member and log the action
    if (userID) {
      // Get user doc to verify they are a member
      const userSnap = await adminDb.doc(`addresses/${userID}`).get();
      const userData = userSnap.data();

      if (!userSnap.exists) {
        return NextResponse.json(
          { success: false, errorMessage: "User must be a member to play audio" },
          { status: 403 },
        );
      }

      if (!userData?.isMember && !userData?.isAdmin && !userData?.isCreator) {
        return NextResponse.json(
          { success: false, errorMessage: "User must be a member to play audio" },
          { status: 403 },
        );
      }

      // Log action
      const now = new Date();
      await adminDb.doc(`activity/${now.getTime()}`).set({
        created: now,
        initiator: userID,
        type: String(action).toUpperCase(),
        sessionID: versionData.sessionID,
        versionID,
      });
    } else {
      // If there is no user, this version must be public and this must be a play action
      if (action !== "play") {
        return NextResponse.json(
          { success: false, errorMessage: "Unauthorized." },
          { status: 401 },
        );
      }

      const settingsSnap = await adminDb.doc("globals/settings").get();
      const settingsData = settingsSnap.data();
      const publicVersions = (settingsData?.stemsCarousel as string[] | undefined) || [];

      if (!publicVersions.includes(versionID)) {
        return NextResponse.json(
          { success: false, errorMessage: "Unauthorized." },
          { status: 401 },
        );
      }
    }

    // Helper to get bucket
    const getBucket = () => admin.storage().bucket();

    // Helper to get signed URL for a single audio file
    const getStem = async (
      audioID: string,
      filename: string = "audio-low.mp3",
    ): Promise<string> => {
      const [signedUrl] = await getBucket()
        .file(`audio/${audioID}/${filename}`)
        .getSignedUrl({
          action: "read",
          expires: Date.now() + 3 * 60 * 60 * 1000, // 3 hours
        });
      return signedUrl;
    };

    // Get data with appropriate file names based on action
    const bounceFileName = action === "download" ? "audio.wav" : "audio.mp3";
    const bounce = await getStem(versionData.bounce, bounceFileName);

    const stemsFileName = action === "download" ? "audio.wav" : "audio-low.mp3";
    const stems = await Promise.all(
      versionData.stems.map((stem: { id: string }) => getStem(stem.id, stemsFileName)),
    );

    return NextResponse.json({
      success: true,
      data: {
        bounce,
        stems,
      },
    });
  } catch (error) {
    console.error("Error doing the thing:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        errorMessage,
      },
      { status: 500 },
    );
  }
}
