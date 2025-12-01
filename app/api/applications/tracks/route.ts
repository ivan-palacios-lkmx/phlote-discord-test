import { ApplicationService } from "@/services/application-service";
import { AudioService } from "@/services/audio-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const applicationId = request.nextUrl.searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    const application = await ApplicationService.getApplication(applicationId);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (!application.tracks || application.tracks.length === 0) {
      return NextResponse.json({ error: "Application has no tracks" }, { status: 404 });
    }

    const trackHashes = application.tracks.map((track) => track.id);

    const tracksSignedUrls = await Promise.all(
      trackHashes.map((hash) => AudioService.getAudioSignedUrlByHash(hash, "low")),
    );

    return NextResponse.json({ tracksSignedUrls }, { status: 200 });
  } catch (error) {
    console.error("Error getting application tracks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
