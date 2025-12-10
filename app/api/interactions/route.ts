import { DiscordService } from "@/services/discord-service";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import { NextResponse } from "next/server";

interface RequestWithWaitUntil extends Request {
  waitUntil?: (promise: Promise<unknown>) => void;
}

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
      const appId = process.env.DISCORD_APP_ID;
      const token = interaction.token;

      if (!appId) {
        console.error("Missing DISCORD_APP_ID for deferred response");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
      }

      const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

      const params = new URLSearchParams();
      params.append("artist", "Test Artist");
      params.append("song", "Test Song Title");
      params.append(
        "bgImage",
        "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=1200&auto=format&fit=crop",
      );
      params.append("avatars", "https://github.com/shadcn.png");
      params.append("avatars", "https://github.com/vercel.png");
      params.append("avatars", "https://github.com/nextjs.png");
      params.append("count", "5");
      params.append("ts", Date.now().toString());

      const ogUrl = `${baseUrl}/api/og?${params.toString()}`;

      const response = NextResponse.json({
        type: 5,
      });

      const updatePromise = (async () => {
        try {
          const webhookUrl = `https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

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
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!discordRes.ok) {
              const errorText = await discordRes.text();
              console.error("Discord Webhook Error:", errorText);
            } else {
              console.log("Successfully updated Discord message with OG image");
            }
          } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === "AbortError") {
              console.error("Discord webhook request timed out after 10 seconds");
            } else {
              console.error("Error sending response to Discord:", error);
            }
          }
        } catch (err) {
          console.error("Error sending deferred response update:", err);
        }
      })();

      const requestWithWaitUntil = request as RequestWithWaitUntil;
      if (requestWithWaitUntil.waitUntil) {
        requestWithWaitUntil.waitUntil(updatePromise);
      }

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

      const response = NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Follow the link in your DMs to verify your identity.",
        },
      });

      const dmPromise = (async () => {
        try {
          await DiscordService.connectCommand(user);
        } catch (error) {
          console.error("Error sending DM:", error);
        }
      })();

      const requestWithWaitUntil = request as RequestWithWaitUntil;
      if (requestWithWaitUntil.waitUntil) {
        requestWithWaitUntil.waitUntil(dmPromise);
      }

      return response;
    }

    return NextResponse.json({ message: "Unknown command" }, { status: 400 });
  } catch (error) {
    console.error("Error handling Discord interaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
