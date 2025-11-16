import { SessionService } from "@/services/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sessions = await SessionService.getSessions();
    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("Error getting sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
