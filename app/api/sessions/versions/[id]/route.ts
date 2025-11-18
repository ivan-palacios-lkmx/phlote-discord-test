import { SessionService } from "@/services/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sessionID = request.nextUrl.pathname.split("/")[2];
    const versionID = request.nextUrl.pathname.split("/").pop();
    if (!sessionID || !versionID) {
      return NextResponse.json(
        { error: "Session ID and version ID are required" },
        { status: 400 },
      );
    }

    const version = await SessionService.getSessionVersion(versionID);

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json(version, { status: 200 });
  } catch (error) {
    console.error("Error getting version:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
