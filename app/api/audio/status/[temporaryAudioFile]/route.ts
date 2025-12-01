import { AudioService } from "@/services/audio-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ temporaryAudioFile: string }> },
): Promise<NextResponse> {
  try {
    const { temporaryAudioFile } = await params;

    const { status, hash } =
      await AudioService.getAudioProcessingStatusWithHash(temporaryAudioFile);

    return NextResponse.json({ status, hash });
  } catch (error) {
    console.error("Error getting audio processing status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
