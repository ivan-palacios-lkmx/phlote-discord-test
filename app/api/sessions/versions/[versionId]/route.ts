import { SessionService } from "@/services/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ versionId: string }> }) {
  try {
    const { versionId } = await params;

    if (!versionId) {
      return NextResponse.json({ error: "Version ID is required" }, { status: 400 });
    }

    const version = await SessionService.getVersion(versionId);

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json(version, { status: 200 });
  } catch (error) {
    console.error("Error getting version:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
