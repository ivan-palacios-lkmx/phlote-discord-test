import {
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
} from "discord-interactions";
import { ButtonStyleTypes } from "discord-interactions";
import ShortUniqueId from "short-unique-id";

/**
 * Generates a quick, non-cryptographic hexadecimal hash from a string.
 *
 * The hash is computed using bitwise operations in a simple manner and is
 * intended for applications like indexing, sharding, cache-busting, or quick lookups
 * where cryptographically secure hashes are not required.
 *
 * The output is always a positive hexadecimal string representation of the hash.
 *
 * @param {string} str - The input string to hash.
 * @returns {string} The generated hexadecimal hash string (non-cryptographic).
 */
export function quickHash(str: string): string {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Normalizes and validates slide items from raw slice data.
 * Filters out invalid items (non-objects, null values) and returns
 * a normalized array of slide objects.
 *
 * @param {unknown[] | undefined} rawItems - Raw items array from slice data.
 * @returns {T[]} Array of validated slide objects.
 */
export function normalizeSlideItems<T extends Record<string, unknown>>(
  rawItems: unknown[] | undefined,
): T[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .filter((item): item is T => item !== null && typeof item === "object")
    .map((item) => item as T);
}

/**
 * Makes a request to Discord API
 * @param endpoint - Discord API endpoint (without base URL)
 * @param options - Request options including method and body
 * @returns Promise resolving to the JSON response
 */
export async function discordRequest(
  endpoint: string,
  options: { method?: string; body?: Record<string, unknown> } = {},
): Promise<unknown> {
  // Append endpoint to root API URL
  const url = `https://discord.com/api/${endpoint}`;

  // Stringify payloads
  const body = options.body ? JSON.stringify(options.body) : undefined;

  // Use fetch to make requests
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });

  // Throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }

  // Return original response
  return res.json();
}

/**
 * Sends a DM to a user with a verification button
 */
export async function dmUser(user: { id: string; username: string }) {
  // Create DM channel with user
  const dmChannel = (await discordRequest("users/@me/channels", {
    method: "POST",
    body: {
      recipient_id: user.id,
    },
  })) as { id: string };

  // Create verification URL
  const frontendURL = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.FRONTEND_URL;
  if (!frontendURL) {
    throw new Error("FRONTEND_URL or NEXT_PUBLIC_FRONTEND_URL is not set");
  }

  const url = new URL(`${frontendURL}/connect-discord`);
  url.searchParams.append("id", user.id);
  url.searchParams.append("username", user.username);
  url.searchParams.append("dmChannel", dmChannel.id);

  // Send message with button
  await discordRequest(`channels/${dmChannel.id}/messages`, {
    method: "POST",
    body: {
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
    },
  });
}

/**
 * Handles Discord interactions
 */
export async function handleInteraction({
  type,
  data,
  member,
}: {
  type: number;
  data?: { name?: string };
  member?: { user?: { id: string; username: string } };
}) {
  // Handle PING
  if (type === InteractionType.PING) {
    return {
      type: InteractionResponseType.PONG,
    };
  }

  // Handle slash commands
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data || {};

    // /connect command
    if (name === "connect") {
      if (!member?.user) {
        throw new Error("User not found in member");
      }

      const { user } = member;
      console.log(`${user.username} triggered /connect`);

      await dmUser(user);

      console.log(`Sent DM to user ${user.username}`);

      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Follow the link in your DMs to verify your identity.",
        },
      };
    }
  }

  throw new Error("Unknown interaction type or command");
}

export function transformToShortAddress(address: string): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatProjectId(projectId: ShortUniqueId): string {
  return projectId.slice(0, 3) + "-" + projectId.slice(3, 7) + "-" + projectId.slice(7, 10);
}
