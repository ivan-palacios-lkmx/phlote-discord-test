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

if (!APPLICATION_ID) {
  console.error("DISCORD_APP_ID is not set in environment variables");
  process.exit(1);
}

if (!DISCORD_TOKEN) {
  console.error("DISCORD_TOKEN is not set in environment variables");
  process.exit(1);
}

const command = {
  name: "connect",
  description: "Connect your wallet to your Discord account",
  type: 1,
};

async function registerCommand() {
  try {
    console.log("Registering /connect command...");
    console.log(`   Application ID: ${APPLICATION_ID}`);

    const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`;
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

    const result = await response.json();
    console.log("Command registered successfully!");
    console.log("   Command ID:", result.id);
    console.log("   Command name:", result.name);
    console.log("\nNote: Global commands may take up to 1 hour to appear in Discord.");
    console.log("   For instant updates, use guild commands instead.");
  } catch (error) {
    console.error("Error registering command:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

registerCommand();
