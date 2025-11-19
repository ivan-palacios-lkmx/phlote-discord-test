import { SessionService } from "@/services/session-service";
import { activityTypeSchema, addressSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { versionId: string } }) {
  try {
    const versionID = params.versionId;

    if (!versionID) {
      return NextResponse.json({ error: "Version ID is required" }, { status: 400 });
    }

    const activity = await SessionService.getVersionActivity(versionID);

    return NextResponse.json(activity, { status: 200 });
  } catch (error) {
    console.error("Error getting version activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { versionId: string; sessionId: string } },
) {
  try {
    const versionID = params.versionId;
    const sessionID = params.sessionId;

    if (!versionID) {
      return NextResponse.json({ error: "Version ID is required" }, { status: 400 });
    }

    if (!sessionID) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const body = await request.json();

    const { type, initiator } = body;

    if (!type || !initiator) {
      return NextResponse.json({ error: "Type and initiator are required" }, { status: 400 });
    }

    if (!activityTypeSchema.safeParse(type).success) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!addressSchema.safeParse(initiator).success) {
      return NextResponse.json({ error: "Invalid initiator" }, { status: 400 });
    }

    const activity = await SessionService.registerSessionActivity(
      sessionID,
      versionID,
      type,
      initiator,
    );

    return NextResponse.json(activity, { status: 200 });
  } catch (error) {
    console.error("Error registering session activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
