import { AudioService } from "@/services/audio-service";
import { GlobalsService } from "@/services/globals-service";
import { PrivyService } from "@/services/privy-service";
import { SessionService } from "@/services/session-service";
import { AudioAction } from "@/types/api";
import { audioActionSchema } from "@/utils/zod-schemas";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { versionId: string } }) {
  try {
    const { versionId: versionID } = params;
    const action = request.nextUrl.searchParams.get("action");

    if (!action || !audioActionSchema.safeParse(action).success) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!versionID) {
      return NextResponse.json({ error: "Version ID is required" }, { status: 400 });
    }

    const cookiesStore = await cookies();
    const privyIdToken = cookiesStore.get("privy-id-token")?.value;
    const settings = await GlobalsService.getSettingsData();
    const isVersionPublic = settings?.stemsCarousel?.includes(versionID);

    let isPremiumUser = false;

    if (privyIdToken) {
      isPremiumUser = await PrivyService.isUserPremium(privyIdToken);
    }

    const isPublicPlay = isVersionPublic && action === "play";
    const isAuthorized = isPublicPlay || isPremiumUser;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const version = await SessionService.getVersion(versionID);

    if (!version?.bounce) {
      return NextResponse.json({ error: "Version bounce not found" }, { status: 404 });
    }

    const stemsHashes = version.stems.map((stem) => stem.id);

    const [stemsSignedUrls, bounceSignedUrl] = await Promise.all([
      AudioService.getStemsSignedUrls(stemsHashes, action as AudioAction),
      AudioService.getBounceSignedUrl(version.bounce, action as AudioAction),
    ]);

    return NextResponse.json({ stemsSignedUrls, bounceSignedUrl }, { status: 200 });
  } catch (error) {
    console.error("Error getting audio:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
