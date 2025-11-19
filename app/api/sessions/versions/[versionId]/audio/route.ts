import { AudioService } from "@/services/audio-service";
import { SessionService } from "@/services/session-service";
import { AudioAction } from "@/types/api";
import { allowedAudioFileExtensionsSchema, audioActionSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { versionId: string; sessionId: string } },
) {
  try {
    const versionID = params.versionId;
    const sessionID = params.sessionId;

    if (!versionID || !sessionID) {
      return NextResponse.json(
        { error: "Version ID and session ID are required" },
        { status: 400 },
      );
    }

    const action = request.nextUrl.searchParams.get("action");

    if (!action || !audioActionSchema.safeParse(action).success) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!versionID) {
      return NextResponse.json({ error: "Version ID is required" }, { status: 400 });
    }

    const version = await SessionService.getSessionVersion(versionID);

    if (!version?.bounce) {
      return NextResponse.json({ error: "Version bounce not found" }, { status: 404 });
    }

    const bounceSignedUrl = await AudioService.getBounceSignedUrl(
      version.bounce,
      action as AudioAction,
    );

    return NextResponse.json({ bounceSignedUrl }, { status: 200 });
  } catch (error) {
    console.error("Error getting audio:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { versionId: string } }) {
  try {
    const versionId = params.versionId;
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    if (!allowedAudioFileExtensionsSchema.safeParse(audioFile.type).success) {
      return NextResponse.json({ error: "Invalid audio file type" }, { status: 400 });
    }

    const { tmpName, status } =
      await AudioService.uploadAudioToStorageAndSetProcessingStatus(audioFile);

    if (status === "error") {
      return NextResponse.json({ error: "Failed to process audio" }, { status: 500 });
    }

    return NextResponse.json({ tmpName, status }, { status: 200 });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
