import { SessionService } from "@/services/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "Version ID is required" }, { status: 400 });
    }
    const version = await SessionService.getSessionVersion(id);
    return NextResponse.json(version, { status: 200 });
  } catch (error) {
    console.error("Error getting version:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
