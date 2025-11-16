import { SettingsService } from "@/services/settings-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await SettingsService.getSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error getting settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
