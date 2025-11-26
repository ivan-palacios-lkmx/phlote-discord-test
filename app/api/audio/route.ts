import { AudioService } from "@/services/audio-service";
import { allowedAudioFileExtensionsSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    if (!allowedAudioFileExtensionsSchema.safeParse(audioFile.type).success) {
      return NextResponse.json({ error: "Invalid audio file type" }, { status: 400 });
    }

    const { tmpName, status } =
      await AudioService.uploadAudioToStorageAndStartProcessing(audioFile);

    if (status === "error") {
      return NextResponse.json({ error: "Failed to process audio" }, { status: 500 });
    }

    return NextResponse.json({ tmpName, status }, { status: 200 });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get("hash");

    if (!hash) {
      return NextResponse.json({ error: "Hash is required" }, { status: 400 });
    }

    const audio = await AudioService.getAudio(hash);

    return NextResponse.json({ audio }, { status: 200 });
  } catch (error) {
    console.error("Error getting audio:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
