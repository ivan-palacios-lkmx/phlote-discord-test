import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { checkAddress } from "@/utils/auth-helpers";
import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Cloud Function to create a Firebase authentication token after verifying a wallet signature.
 *
 * This endpoint verifies that a user owns a wallet address by validating a cryptographic signature
 * against a previously generated nonce message. Upon successful verification, it creates a
 * Firebase custom authentication token that can be used to authenticate the user.
 *
 * @param request - Next.js request object
 * @param request.nextUrl.searchParams - Query parameters
 * @param request.nextUrl.searchParams.message - The nonce message that was signed
 * @param request.nextUrl.searchParams.signature - The cryptographic signature of the message
 * @param request.nextUrl.searchParams.address - The Ethereum wallet address
 * @returns Response object with success status and token if successful
 * @returns {boolean} success - Whether the token creation was successful
 * @returns {string} [token] - Firebase custom authentication token (only if success is true)
 *
 * @example
 * GET /api/authCreateToken?message=0x123...&signature=0xabc...&address=0x456...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const message = searchParams.get("message");
    const signature = searchParams.get("signature");
    const address = searchParams.get("address");

    // Validate
    if (!message) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    if (!signature) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const cleanAddress = checkAddress(address);
    if (!cleanAddress) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Check nonce with DB to validate.
    const db = adminDb;
    const nonceDocQ = await db
      .collection("nonces")
      .where("message", "==", message)
      .where("address", "==", cleanAddress)
      .get();

    const docSnap = nonceDocQ.docs[0];
    if (!docSnap) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const docData = docSnap.data();
    const expires = docData.expires?.toDate();

    // Validate doc data
    if (docData.address !== cleanAddress) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    if (docData.message !== message) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    if (expires && expires < new Date()) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Get address of signer
    const signerAddress = ethers.verifyMessage(docData.message, signature);

    // Verify that signer is provided address.
    if (signerAddress !== cleanAddress) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Delete nonce
    await docSnap.ref.delete();

    // Issue auth token for frontend and return
    const token = await adminAuth.createCustomToken(cleanAddress);
    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error("Error requesting token:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
