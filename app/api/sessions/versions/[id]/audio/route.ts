import { AudioService } from "@/services/audio-service";
import { SessionService } from "@/services/session-service";
import { AudioAction } from "@/types/api";
import { audioActionSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sessionID = request.nextUrl.pathname.split("/")[2];
    const versionID = request.nextUrl.pathname.split("/").pop();
    const action = request.nextUrl.searchParams.get("action");

    if (!action || !audioActionSchema.safeParse(action).success) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!sessionID || !versionID) {
      return NextResponse.json(
        { error: "Session ID and version ID are required" },
        { status: 400 },
      );
    }

    const version = await SessionService.getSessionVersion(sessionID, versionID);

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
