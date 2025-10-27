import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/account?address=0x123...
 *
 * Fetches account information for a given wallet address
 *
 * TODO: Connect to database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
        { status: 400 }
      );
    }

    // Validate address format (basic validation)
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database query
    const accountInfo = {
      address,
      role: "admin", // TODO: Get from database - can be 'admin', 'creator', or 'user'
      username: null,
      bio: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: accountInfo,
    });
  } catch (error) {
    console.error("Error fetching account info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
