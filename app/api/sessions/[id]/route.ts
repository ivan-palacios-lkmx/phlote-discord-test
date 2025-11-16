import { SessionService } from "@/services/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split("/").pop() || "";
    const session = await SessionService.getSession(id);
    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Error getting session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
