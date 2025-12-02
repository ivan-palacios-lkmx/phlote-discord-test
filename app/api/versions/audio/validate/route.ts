import { AudioService } from "@/services/audio-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bounceHash, stemHashes } = body;

    if (!bounceHash || !Array.isArray(stemHashes) || stemHashes.length === 0) {
      return NextResponse.json(
        { error: "Bounce hash and stem hashes are required" },
        { status: 400 },
      );
    }

    const isValid = await AudioService.validateAudioDurations(bounceHash, stemHashes);

    if (isValid) {
      return NextResponse.json({ valid: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { valid: false, error: "Audio durations do not match" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error validating audio durations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
