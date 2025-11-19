import { SessionService } from "@/services/session-service";
import { activityTypeSchema, addressSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionID = params.sessionId;

    if (!sessionID) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const activity = await SessionService.getSessionActivity(sessionID);

    return NextResponse.json(activity, { status: 200 });
  } catch (error) {
    console.error("Error getting session activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
