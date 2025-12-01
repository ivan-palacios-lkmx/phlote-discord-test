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
}
