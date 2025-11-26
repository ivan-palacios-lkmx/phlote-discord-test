import { AudioService } from "@/services/audio-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ temporaryAudioFile: string }> },
): Promise<NextResponse> {
  try {
    const { temporaryAudioFile } = await params;

    const audioStatus = await AudioService.getAudioProcessingStatus(temporaryAudioFile);

    return NextResponse.json({ id: temporaryAudioFile, status: audioStatus });
  } catch (error) {
    console.error("Error getting audio processing status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
