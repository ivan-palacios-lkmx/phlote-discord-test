import { AudioService } from "@/services/audio-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { temporaryAudioFile: string } },
): Promise<NextResponse> {
  const temporaryAudioFile = params.temporaryAudioFile;

  const audioStatus = await AudioService.getAudioProcessingStatus(temporaryAudioFile);

  return NextResponse.json({ id: temporaryAudioFile, status: audioStatus });
}
