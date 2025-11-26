import { AudioService } from "@/services/audio-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ audioId: string }> },
) {
  try {
    const { audioId } = await params;

    if (!audioId) {
      return NextResponse.json({ error: "Audio ID is required" }, { status: 400 });
    }

    const audio = await AudioService.getAudioWaveTrace(audioId);

    if (!audio) {
      return NextResponse.json({ error: "Audio not found" }, { status: 404 });
    }

    return NextResponse.json({ audio }, { status: 200 });
  } catch (error) {
    console.error("Error getting audio wave trace:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
