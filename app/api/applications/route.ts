import { ApplicationService } from "@/services/application-service";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const applications = await ApplicationService.getApplications();
    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error("Error getting applications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
