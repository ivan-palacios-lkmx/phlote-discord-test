import {
  AddressDocWithID,
  AddressDocWithPrivateData,
  AddressWithPrivateData,
} from "@/types/database";
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
    const MOCKED_URL = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/connect-discord`;

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

  static async createChannel(guildId: string, name: string, type: number = 0) {
    if (!this.token) {
      throw new Error("DiscordService not initialized");
    }

    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        type,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create Discord channel in guild ${guildId}: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }

  static async getChannel(channelId: string) {
    if (!this.token) {
      throw new Error("DiscordService not initialized");
    }

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
      headers: {
        Authorization: `Bot ${this.token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get Discord channel ${channelId}: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }

  static async getChannelMessageCount(channelId: string): Promise<number> {
    const channel = await this.getChannel(channelId);
    return channel.message_count || 0;
  }

  static async getMember(guildId: string, userId: string) {
    if (!this.token) {
      throw new Error("DiscordService not initialized");
    }

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${this.token}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get Discord member ${userId} in guild ${guildId}: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }

  static async updateMember(guildId: string, userId: string, data: { roles: string[] }) {
    if (!this.token) {
      throw new Error("DiscordService not initialized");
    }

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to update Discord member ${userId} in guild ${guildId}: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }

  static async updateDiscordUserRoles(addressDoc: AddressDocWithPrivateData) {
    const guildId = process.env.DISCORD_GUILD_ID;
    const adminRoleId = process.env.DISCORD_ADMIN_ROLE_ID;
    const creatorRoleId = process.env.DISCORD_CREATOR_ROLE_ID;
    const memberRoleId = process.env.DISCORD_MEMBER_ROLE_ID;
    console.log("guildId", guildId);
    console.log("adminRoleId", adminRoleId);
    console.log("creatorRoleId", creatorRoleId);
    console.log("memberRoleId", memberRoleId);
    if (!guildId) {
      console.warn("DISCORD_GUILD_ID is not set");
      return;
    }

    const discordUserID = addressDoc.private?.discordUserID;
    console.log("discordUserID", discordUserID);
    if (!discordUserID) {
      console.warn(`No discordUserID found for address ${addressDoc.id}`);
      return;
    }

    try {
      const member = await this.getMember(guildId, discordUserID);
      const currentRoles: string[] = member.roles || [];

      // Identify which managed roles are configured
      const managedRoles = [adminRoleId, creatorRoleId, memberRoleId].filter(
        (role): role is string => !!role,
      );

      // Filter out managed roles from the user's current roles to start clean
      const rolesToKeep = currentRoles.filter((role) => !managedRoles.includes(role));

      // Add back the roles that should be present
      if (addressDoc.isAdmin && adminRoleId) rolesToKeep.push(adminRoleId);
      if (addressDoc.isCreator && creatorRoleId) rolesToKeep.push(creatorRoleId);
      if (addressDoc.isMember && memberRoleId) rolesToKeep.push(memberRoleId);

      // Deduplicate just in case
      const finalRoles = Array.from(new Set(rolesToKeep));

      // Only update if roles have changed
      const currentRolesSorted = [...currentRoles].sort();
      const finalRolesSorted = [...finalRoles].sort();

      console.log("finalRoles", finalRoles);
      if (JSON.stringify(currentRolesSorted) !== JSON.stringify(finalRolesSorted)) {
        await this.updateMember(guildId, discordUserID, { roles: finalRoles });
      }
    } catch (error) {
      console.error(`Error updating Discord roles for user ${discordUserID}:`, error);
    }
  }
}
