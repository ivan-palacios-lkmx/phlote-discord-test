import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";

export class DiscordService {
  private static token: string | null = null;

  static initialize(token: string) {
    this.token = token;
  }

  static async sendMessageToChannel(
    channelId: string,
    message: string,
    params: { embeds?: any[]; components?: any[] } = {},
  ) {
    if (!this.token) {
      throw new Error("DiscordService not initialized");
    }

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
        ...params,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to send message to Discord channel ${channelId}: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }

  static async connectCommand(user: { id: string; username: string }) {
    if (!this.token) {
      throw new Error("DiscordService not initialized");
    }

    const dmChannelResponse = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        Authorization: `Bot ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: user.id,
      }),
    });

    if (!dmChannelResponse.ok) {
      const errorText = await dmChannelResponse.text();
      throw new Error(
        `Failed to create DM channel: ${dmChannelResponse.status} ${dmChannelResponse.statusText} - ${errorText}`,
      );
    }

    const dmChannel = (await dmChannelResponse.json()) as { id: string };

    // TODO: Replace MOCKED_URL with the actual frontend URL
    const MOCKED_URL = "https://example.com/connect-discord";
    const url = new URL(MOCKED_URL);
    url.searchParams.append("id", user.id);
    url.searchParams.append("username", user.username);
    url.searchParams.append("dmChannel", dmChannel.id);

    const response = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.BUTTON,
                label: "Verify",
                style: ButtonStyleTypes.LINK,
                url: url.toString(),
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to send DM message: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }
}
