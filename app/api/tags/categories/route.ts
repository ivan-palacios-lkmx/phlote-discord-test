import { GlobalsService } from "@/services/globals-service";
import { tagCategorySchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await GlobalsService.getCategories();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, categoryType } = body;

    if (!category) {
      return NextResponse.json({ error: "Missing category" }, { status: 400 });
    }

    if (!tagCategorySchema.safeParse(category).success) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    await GlobalsService.createTagCategory(category, categoryType as "member" | "session");

    return NextResponse.json({ message: "Category created successfully" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
