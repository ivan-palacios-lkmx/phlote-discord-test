import { SessionService } from "@/services/session-service";
import { versionDetailsSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionID = params.id;

    if (!sessionID) {
      return NextResponse.json({ error: "Session does not exist" }, { status: 400 });
    }

    const versions = await SessionService.getSessionVersions(sessionID);

    return NextResponse.json(versions, { status: 200 });
  } catch (error) {
    console.error("Error getting versions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionID = params.id;

    const body = await request.json();
    const versionDetails = body;

    if (!versionDetails) {
      return NextResponse.json({ error: "Version details are required" }, { status: 400 });
    }

    if (!sessionID) {
      return NextResponse.json({ error: "Session does not exist" }, { status: 400 });
    }

    if (!versionDetailsSchema.safeParse(versionDetails).success) {
      return NextResponse.json({ error: "Invalid version details" }, { status: 400 });
    }

    const version = await SessionService.createVersion(sessionID, versionDetails);

    return NextResponse.json(version, { status: 200 });
  } catch (error) {
    console.error("Error creating version:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
