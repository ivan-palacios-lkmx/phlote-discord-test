import { SessionService } from "@/services/session-service";
import { NextResponse } from "next/server";

export async function GET({ params }: { params: { versionId: string } }) {
  try {
    const versionID = params.versionId;

    if (!versionID) {
      return NextResponse.json({ error: "Version ID is required" }, { status: 400 });
    }

    const version = await SessionService.getVersion(versionID);

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json(version, { status: 200 });
  } catch (error) {
    console.error("Error getting version:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
