import { SessionService } from "@/services/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionID = params.id;

    if (!sessionID) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const versions = await SessionService.getSessionVersions(sessionID);

    return NextResponse.json(versions, { status: 200 });
  } catch (error) {
    console.error("Error getting versions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
