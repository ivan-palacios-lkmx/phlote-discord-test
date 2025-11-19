import { SessionService } from "@/services/session-service";
import { sessionDetailsSchema } from "@/utils/zod-schemas";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sessions = await SessionService.getSessions();
    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("Error getting sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionDetails = await request.json();

    if (!sessionDetailsSchema.safeParse(sessionDetails).success) {
      return NextResponse.json({ error: "Invalid session details" }, { status: 400 });
    }

    const { sessionId, versionId } = await SessionService.createSession(sessionDetails);

    return NextResponse.json(
      { message: "Session created successfully", sessionId, versionId },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
