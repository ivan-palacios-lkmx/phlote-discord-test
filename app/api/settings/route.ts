import { GlobalsService } from "@/services/globals-service";
import { SettingsPatch } from "@/types/api";
import { isBodyEmpty } from "@/utils/functions";
import { addressSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const settings = await GlobalsService.getSettingsData();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error getting settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (isBodyEmpty(body)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { membershipContracts } = body;

    if (!addressSchema.safeParse(membershipContracts).success) {
      return NextResponse.json({ error: "Invalid membership contracts" }, { status: 400 });
    }

    const patch: SettingsPatch = {
      membershipContracts,
    };

    const settings = await GlobalsService.patchSettingsData(patch);
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
