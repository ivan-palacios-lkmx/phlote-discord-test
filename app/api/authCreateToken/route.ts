import { adminAuth } from "@/lib/firebase-admin";
import { checkAddress } from "@/utils/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    // Validate
    if (!address) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const cleanAddress = checkAddress(address);
    if (!cleanAddress) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // TODO: Implement nonce validation with message signing
    // Currently disabled because we don't have a way to show the nonce message to the user
    // for them to sign. Once we implement a UI flow to display and sign the nonce message,
    // we should:
    // 1. Request a nonce from /api/authCreateNonce
    // 2. Show the message to the user and have them sign it
    // 3. Verify the signature and nonce before issuing the token
    // 4. This will provide better security by proving wallet ownership

    // For now, we trust that the user is authenticated via Privy and issue the token
    // based solely on the wallet address

    // Issue auth token for frontend and return
    const token = await adminAuth.createCustomToken(cleanAddress);
    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error("Error requesting token:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
