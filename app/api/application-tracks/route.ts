import { adminAuth, adminDb } from "@/lib/firebase-admin";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/application-tracks?applicationID=xxx
 *
 * Fetches application tracks for a given application ID
 * Requires authentication: User must be a creator
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const applicationID = searchParams.get("applicationID");

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

    // Validate user is a creator
    if (!userID) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "User must be a creator to review application audio",
        },
        { status: 401 },
      );
    }

    // Get user doc to verify they are a creator
    const userSnap = await adminDb.doc(`addresses/${userID}`).get();
    const userData = userSnap.data();

    if (!userSnap.exists || !userData?.isCreator) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "User must be a creator to review application audio",
        },
        { status: 403 },
      );
    }

    // Get application data
    const applicationSnap = await adminDb.doc(`applications/${applicationID}`).get();
    const applicationData = applicationSnap.data();

    // Validate application has tracks
    if (!applicationData?.tracks || !applicationData.tracks.length) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "There are no tracks with this application.",
        },
        { status: 400 },
      );
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

    // Get signed URLs for all tracks (using audio.mp3 for creators)
    const tracks = await Promise.all(
      applicationData.tracks.map((track: { id: string }) => getStem(track.id, "audio.mp3")),
    );

    return NextResponse.json({
      success: true,
      data: tracks,
    });
  } catch (error) {
    console.error("Error getting application tracks:", error);
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
