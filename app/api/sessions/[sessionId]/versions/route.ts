import { PrivyService } from "@/services/privy-service";
import { SessionService } from "@/services/session-service";
import { VersionDetails } from "@/types/database";
import { versionDetailsSchema } from "@/utils/zod-schemas";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { name, bpm, notes, tags, stems, bounce, sourceVersion } = body;

    if (!name || !bpm || !tags || !stems || !bounce) {
      return NextResponse.json({ error: "Version details are required" }, { status: 400 });
    }

    if (!sessionId) {
      console.log("sessionId is required", body);
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    if (
      !versionDetailsSchema.safeParse({ name, bpm, notes, tags, stems, bounce, sourceVersion })
        .success
    ) {
      console.log("version details are invalid", body);
      return NextResponse.json({ error: "Invalid version details" }, { status: 400 });
    }

    const cookiesStore = await cookies();
    const privyIdToken = cookiesStore.get("privy-id-token")?.value;

    if (!privyIdToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creator = await PrivyService.getWalletAddressFromToken(privyIdToken);

    if (!creator) {
      return NextResponse.json({ error: "Wallet address not found" }, { status: 400 });
    }

    const versionDetails: VersionDetails = {
      creator,
      bpm,
      notes,
      tags,
      stems,
      bounce,
      sourceVersion,
    };

    const version = await SessionService.createVersion(sessionId, versionDetails);

    if (!version) {
      return NextResponse.json({ error: "Failed to create version" }, { status: 500 });
    }

    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    console.error("Error creating version:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
