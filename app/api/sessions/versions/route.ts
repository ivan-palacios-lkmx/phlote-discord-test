import { SessionService } from "@/services/session-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const versions = await SessionService.getSessionVersions();
    return NextResponse.json(versions, { status: 200 });
  } catch (error) {
    console.error("Error getting versions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
