import { GlobalsService } from "@/services/settings-service";
import { createTagSchema, tagCategorySchema, updateTagSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const category = searchParams.get("category") || undefined;

    if (!tagCategorySchema.safeParse(category).success) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const tags = await GlobalsService.getTags(category as "member" | "session");

    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tagName, category } = body;

    if (!tagName || !category) {
      return NextResponse.json({ error: "Missing name or category" }, { status: 400 });
    }

    if (!createTagSchema.safeParse({ tagName, category }).success) {
      return NextResponse.json({ error: "Invalid tag name or category" }, { status: 400 });
    }

    const tag = await GlobalsService.createTag(tagName, category);

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { oldTagName, newTagName, category } = body;

    if (!oldTagName || !newTagName || !category) {
      return NextResponse.json(
        { error: "Missing old tag name, new tag name, or category" },
        { status: 400 },
      );
    }

    if (!updateTagSchema.safeParse({ oldTagName, newTagName, category }).success) {
      return NextResponse.json({ error: "Invalid tag name or category" }, { status: 400 });
    }

    const tag = await GlobalsService.updateTag(oldTagName, newTagName, category);

    return NextResponse.json(tag, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
