import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { privyId, email, walletAddresses, displayName } = body;

    if (!privyId) {
      return NextResponse.json(
        { error: "privyId is required" },
        { status: 400 }
      );
    }

    const userData = {
      privyId,
      email,
      walletAddresses: walletAddresses || [],
      displayName: displayName || email?.split("@")[0],
      role: "user", // TODO: Get from database or user input
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to database
    // await db.users.upsert({
    //   where: { privyId },
    //   create: userData,
    //   update: { ...userData, updatedAt: new Date() }
    // });

    console.log("Syncing user:", userData);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
