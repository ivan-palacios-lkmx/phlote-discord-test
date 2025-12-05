import { ApplicationService } from "@/services/application-service";
import { applicationFormSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

/**
 * Public endpoint for creating creator applications.
 * This endpoint does not require authentication.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { firstName, lastName, email, city, info, workLink, ethAddress, tracks } = body;

  if (
    !applicationFormSchema.safeParse({
      firstName,
      lastName,
      email,
      city,
      info,
      workLink,
      ethAddress,
      tracks,
    }).success
  ) {
    return NextResponse.json({ error: "Invalid application" }, { status: 400 });
  }

  try {
    const applicationId = await ApplicationService.createApplication(body);

    return NextResponse.json({ applicationId }, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
