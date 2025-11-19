import { AddressService } from "@/services/address-service";
import { createAddressSchema, visibilitySchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  try {
    const visibility = searchParams.get("visibility") as "public" | "private" | undefined;

    if (!visibilitySchema.safeParse(visibility).success) {
      return NextResponse.json({ error: "Invalid visibility parameter" }, { status: 400 });
    }

    const addressesAndTotalCount = await AddressService.getAddressesAndTotalCount(visibility);

    return NextResponse.json(addressesAndTotalCount, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, isAddressMember, addressAvatar } = body;

    if (!createAddressSchema.safeParse(body).success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const newAddress = await AddressService.createAddress(address, isAddressMember, addressAvatar);

    if (!newAddress) {
      return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
    }

    return NextResponse.json(newAddress, { status: 200 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
