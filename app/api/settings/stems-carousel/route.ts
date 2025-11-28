import { GlobalsService } from "@/services/globals-service";
import { stemsCarouselSchema, versionIDSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const stemsCarousel = await GlobalsService.getStemsCarousel();
    return NextResponse.json(stemsCarousel, { status: 200 });
  } catch (error) {
    console.error("Error getting stems carousel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { versionID } = body;

    if (!versionIDSchema.safeParse(versionID).success) {
      return NextResponse.json({ error: "Invalid version ID" }, { status: 400 });
    }

    await GlobalsService.addVersionToStemsCarousel(versionID);

    return NextResponse.json({ message: "Version added to stems carousel" }, { status: 200 });
  } catch (error) {
    console.error("Error adding version to stems carousel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { stemsCarousel } = body;

    if (!stemsCarouselSchema.safeParse(stemsCarousel).success) {
      return NextResponse.json({ error: "Invalid stems carousel" }, { status: 400 });
    }

    await GlobalsService.updateStemsCarousel(stemsCarousel);

    return NextResponse.json({ message: "Stems carousel updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating stems carousel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
