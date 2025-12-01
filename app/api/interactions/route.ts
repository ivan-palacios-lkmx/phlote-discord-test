import { DiscordService } from "@/services/discord-service";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
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
    const channel_id = interaction.channel_id;
    const user = interaction.user || interaction.member?.user;

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

      const userInfo = {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        global_name: user.global_name,
        avatar: user.avatar,
      };

      const messageContent = `Connect command received from user:\n**Username:** ${userInfo.username}${userInfo.discriminator ? `#${userInfo.discriminator}` : ""}\n**ID:** ${userInfo.id}\n**Global Name:** ${userInfo.global_name || "N/A"}`;

      if (channel_id) {
        try {
          await DiscordService.sendMessageToChannel(channel_id, messageContent);
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: messageContent },
          });
        } catch (error) {
          console.error("Error sending message to Discord:", error);
          return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
        }
      } else {
        console.error("Channel ID missing");
        return NextResponse.json({ error: "Channel ID missing" }, { status: 400 });
      }
    }

    return NextResponse.json({ message: "Unknown command" }, { status: 400 });
  } catch (error) {
    console.error("Error handling Discord interaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
