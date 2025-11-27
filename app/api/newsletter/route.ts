import { newsletterFormSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!newsletterFormSchema.safeParse(body).success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    return NextResponse.json({ message: "Received" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
