import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/version-stems?versionID=xxx&action=play
 *
 * Fetches version stems for a given version ID
 *
 * TODO: Connect to database/backend service
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const versionID = searchParams.get("versionID");
    const action = searchParams.get("action") || "play";
    void action; // TODO: Use action parameter when implementing

    if (!versionID) {
      return NextResponse.json({ error: "versionID parameter is required" }, { status: 400 });
    }

    // TODO: Replace with actual database/backend service call
    // TODO: Fetch version stems from database or external service
    const versionStems = {
      bounce: "",
      stems: [],
    };

    return NextResponse.json({
      success: true,
      data: versionStems,
    });
  } catch (error) {
    console.error("Error fetching version stems:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
