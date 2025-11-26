import { SessionService } from "@/services/session-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const { sessionId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const index = searchParams.get("index");
  const indexNumber = index ? parseInt(index, 10) : undefined;

  if (index && isNaN(indexNumber!)) {
    return NextResponse.json({ error: "Invalid index parameter" }, { status: 400 });
  }

  const versions = await SessionService.getSessionVersions(sessionId, indexNumber);
  return NextResponse.json(versions);
}
