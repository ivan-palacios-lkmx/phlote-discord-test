import { SessionService } from "@/services/session-service";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { sessionId: string } }) {
  const { sessionId } = await params;
  const versions = await SessionService.getSessionVersions(sessionId);
  return NextResponse.json(versions);
}
