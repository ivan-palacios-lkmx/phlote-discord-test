import { handleInteraction } from "@/utils/functions";
import { verifyKey } from "discord-interactions";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/discord/interaction
 *
 * Handles Discord interaction requests (slash commands, buttons, etc.)
 * Verifies request signature and processes interactions
 */
export async function POST(request: NextRequest) {
  try {
    // Get signature and timestamp from headers
    const signature = request.headers.get("x-signature-ed25519");
    const timestamp = request.headers.get("x-signature-timestamp");

    if (!signature || !timestamp) {
      return NextResponse.json({ error: "Missing signature headers" }, { status: 401 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const publicKey = process.env.DISCORD_PUBLIC_KEY;

    if (!publicKey) {
      console.error("DISCORD_PUBLIC_KEY is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Verify signature using discord-interactions
    const isValid = verifyKey(rawBody, signature, timestamp, publicKey);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse body
    const body = JSON.parse(rawBody) as {
      type: number;
      data?: { name?: string };
      member?: { user?: { id: string; username: string } };
    };

    // Handle interaction
    const response = await handleInteraction(body);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error handling discord interaction:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ errorMessage }, { status: 500 });
  }
}
