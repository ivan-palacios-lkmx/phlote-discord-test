import { SessionService } from "@/services/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const versionID = params.id;
    const activity = await SessionService.getVersionActivity(versionID);
    return NextResponse.json(activity, { status: 200 });
  } catch (error) {
    console.error("Error getting version activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
