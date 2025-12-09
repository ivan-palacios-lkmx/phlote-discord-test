import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, "");
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  } catch {
    // File doesn't exist, skip
  }
}

loadEnvFile(resolve(__dirname, "../.env.local"));
loadEnvFile(resolve(__dirname, "../.env"));

const APPLICATION_ID = process.env.DISCORD_APP_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!APPLICATION_ID || !DISCORD_TOKEN || !GUILD_ID) {
  console.error(
    "Missing environment variables: DISCORD_APP_ID, DISCORD_TOKEN, or DISCORD_GUILD_ID",
  );
  process.exit(1);
}

const command = {
  name: "og-test",
  description: "Test the OG Image generation",
  type: 1,
};

async function registerCommand() {
  try {
    console.log("Registering /og-test command as guild command...");
    const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bot ${DISCORD_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData, null, 2));
    }

    console.log("Command /og-test registered successfully!");
  } catch (error) {
    console.error("Error registering command:", error);
    process.exit(1);
  }
}

registerCommand();
