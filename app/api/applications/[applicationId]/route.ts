import { ApplicationService } from "@/services/application-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  try {
    const { applicationId } = await params;

    const application = await ApplicationService.getApplication(applicationId);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error("Error getting application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
