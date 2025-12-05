import { AudioService } from "@/services/audio-service";
import { allowedAudioFileExtensionsSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, fileType } = body;

    if (!filename || !fileType) {
      return NextResponse.json({ error: "Filename and fileType are required" }, { status: 400 });
    }

    if (!allowedAudioFileExtensionsSchema.safeParse(fileType).success) {
      return NextResponse.json({ error: "Invalid audio file type" }, { status: 400 });
    }

    const { uploadUrl, tmpName } = await AudioService.getAudioUploadData(filename, fileType);

    return NextResponse.json({ uploadUrl, tmpName, status: "processing" }, { status: 200 });
  } catch (error) {
    console.error("Error initializing audio upload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
