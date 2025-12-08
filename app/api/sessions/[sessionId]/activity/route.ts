import { SessionService } from "@/services/session-service";
import { activityTypeSchema, addressSchema, versionIDSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const initiator = searchParams.get("initiator");
    const type = searchParams.get("type");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    let validatedInitiator: string | undefined;
    let validatedType: "PLAY" | "DOWNLOAD" | undefined;

    if (initiator) {
      const parsedInitiator = addressSchema.safeParse(initiator);
      if (parsedInitiator.success) {
        validatedInitiator = parsedInitiator.data;
      }
    }

    if (type) {
      const parsedType = activityTypeSchema.safeParse(type);
      if (parsedType.success) {
        validatedType = parsedType.data;
      }
    }

    const activity = await SessionService.getSessionActivity(
      sessionId,
      60,
      validatedInitiator,
      validatedType,
    );

    return NextResponse.json(activity, { status: 200 });
  } catch (error) {
    console.error("Error getting session activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { type, initiator, versionId } = body;

    if (!type || !initiator || !versionId) {
      return NextResponse.json(
        { error: "Type, initiator and versionId are required" },
        { status: 400 },
      );
    }

    if (!activityTypeSchema.safeParse(type).success) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!addressSchema.safeParse(initiator).success) {
      return NextResponse.json({ error: "Invalid initiator" }, { status: 400 });
    }

    if (!versionIDSchema.safeParse(versionId).success) {
      return NextResponse.json({ error: "Invalid versionId" }, { status: 400 });
    }

    const activity = await SessionService.registerSessionActivity(
      sessionId,
      versionId,
      type,
      initiator,
    );

    return NextResponse.json(activity, { status: 200 });
  } catch (error) {
    console.error("Error registering session activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
