import { adminDb } from "@/lib/firebase-admin";
import { checkAddress, cleanNonces, createSigMessage } from "@/utils/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

const LIFESPAN_MS = 1 * 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const cleanAddress = checkAddress(address);
    if (!cleanAddress) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const db = adminDb;
    const hex = Date.now().toString(16).slice(-6);
    const nonce = `0x${hex}`;

    const message = createSigMessage(nonce);

    await db.doc(`nonces/${cleanAddress}:${nonce}`).set({
      created: new Date(),
      expires: new Date(Date.now() + LIFESPAN_MS),
      address: cleanAddress,
      message,
      nonce,
    });

    // Clean out old nonces async
    cleanNonces().catch((err) => {
      console.error("Error cleaning nonces:", err);
    });

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error("Error creating nonce:", err);
    // Try to clean nonces even on error
    cleanNonces().catch((err) => {
      console.error("Error cleaning nonces:", err);
    });
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
