import { DiscordService } from "@/services/discord-service";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("request", request);
    const signature = request.headers.get("X-Signature-Ed25519");
    const timestamp = request.headers.get("X-Signature-Timestamp");
    const publicKey = process.env.DISCORD_PUBLIC_KEY;

    if (!publicKey) {
      console.error("DISCORD_PUBLIC_KEY not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    if (!signature || !timestamp) {
      console.error("Missing signature headers", { signature, timestamp });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.text();

    const isValidRequest = await verifyKey(body, signature, timestamp, publicKey);

    if (!isValidRequest) {
      console.error("Invalid request signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interaction = JSON.parse(body);

    if (interaction.type === InteractionType.PING) {
      return NextResponse.json({ type: InteractionResponseType.PONG });
    }

    const data = interaction.data;
    const name = data?.name;
    const user = interaction.user || interaction.member?.user;

    if (name === "og-test") {
      const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
      // Add a random param to avoid caching issues during test
      console.log("baseUrl", baseUrl);
      const ogUrl = `${baseUrl}/api/og?ts=${Date.now()}`;

      // Use DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE (Type 5) to acknowledge the interaction immediately
      // This prevents the "Application did not respond" error on slow networks or cold starts
      // Then we update the message asynchronously

      // We need to return the response immediately
      const response = NextResponse.json({
        type: 5, // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
      });

      // Process the follow-up asynchronously
      (async () => {
        try {
          // Wait a bit to simulate work or just ensure the deferred response is processed by Discord
          // In a real scenario, this is where you'd do the heavy lifting

          const appId = process.env.DISCORD_APP_ID;
          const token = interaction.token;

          if (!appId) {
            console.error("Missing DISCORD_APP_ID for deferred response");
            return;
          }

          // Use the public URL so Discord can access it
          const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
          const ogUrl = `${baseUrl}/api/og?ts=${Date.now()}`;

          console.log("Sending OG URL to Discord:", ogUrl);

          const webhookUrl = `https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`;

          try {
            const discordRes = await fetch(webhookUrl, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: null,
                embeds: [
                  {
                    title: "OG Image Test",
                    description: "Testing dynamic OG Image generation (Direct URL)",
                    color: 0x00ff00,
                    image: {
                      url: ogUrl,
                    },
                    footer: {
                      text: `URL: ${ogUrl}`,
                    },
                  },
                ],
              }),
            });

            if (!discordRes.ok) {
              const errorText = await discordRes.text();
              console.error("Discord Webhook Error:", errorText);
            }
          } catch (error) {
            console.error("Error sending response to Discord:", error);
          }
        } catch (err) {
          console.error("Error sending deferred response update:", err);
        }
      })();

      return response;
    }

    if (name === "connect") {
      const token = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;

      if (!token) {
        console.error("Discord token not configured");
        return NextResponse.json({ error: "Discord token not configured" }, { status: 500 });
      }

      if (!user) {
        console.error("User not found in interaction");
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }

      DiscordService.initialize(token);

      // Respond immediately to avoid "application did not respond" error
      const response = NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Follow the link in your DMs to verify your identity.",
        },
      });

      // Send DM asynchronously after responding
      (async () => {
        try {
          await DiscordService.connectCommand(user);
        } catch (error) {
          console.error("Error sending DM:", error);
        }
      })();

      return response;
    }

    return NextResponse.json({ message: "Unknown command" }, { status: 400 });
  } catch (error) {
    console.error("Error handling Discord interaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
