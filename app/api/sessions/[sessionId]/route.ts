import { SessionService } from "@/services/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const session = await SessionService.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Error getting session:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId;
    const name = await request.json();

    if (!sessionId || !name) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { success } = await SessionService.updateSessionName(sessionId, name);

    if (!success) {
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    }

    return NextResponse.json({ message: "Session updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
