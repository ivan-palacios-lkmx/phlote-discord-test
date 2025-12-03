import { GlobalsService } from "@/services/globals-service";
import { versionIDSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ versionID: string }> },
) {
  try {
    const { versionID } = await params;

    if (!versionID) {
      return NextResponse.json({ error: "Version ID is required" }, { status: 400 });
    }

    if (!versionIDSchema.safeParse(versionID).success) {
      return NextResponse.json({ error: "Invalid version ID" }, { status: 400 });
    }

    await GlobalsService.deleteVersionFromStemsCarousel(versionID);
    return NextResponse.json({ message: "Version removed from stems carousel" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting version from stems carousel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
