import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { checkAddress } from "@/utils/auth-helpers";
import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";

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
