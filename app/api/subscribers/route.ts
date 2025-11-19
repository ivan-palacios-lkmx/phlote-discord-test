import { NewsletterService } from "@/services/newsletter-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body;
  try {
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await NewsletterService.addSubscriber(email);

    return NextResponse.json({ message: "Subscriber added successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error adding subscriber:", error);
    return NextResponse.json({ message: "Failed to add subscriber" }, { status: 500 });
  }
}
