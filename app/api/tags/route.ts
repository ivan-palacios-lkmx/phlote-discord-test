import { GlobalsService } from "@/services/settings-service";
import { tagCategorySchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const category = searchParams.get("category") || undefined;

    if (!tagCategorySchema.safeParse(category).success) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const tags = await GlobalsService.getTags(category as "member" | "session");

    return NextResponse.json(tags);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
