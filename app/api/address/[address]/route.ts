import { AddressService } from "@/services/address-service";
import { addressSchema, roleSchema, slugSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;

    const includePrivate = searchParams.get("include") === "private";

    const { address } = await params;

    if (!addressSchema.safeParse(address).success) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
    }

    const addressDoc = await AddressService.getSingleAddress(address, includePrivate);

    if (!addressDoc) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json(addressDoc, { status: 200 });
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { address: string } },
): Promise<NextResponse> {
  try {
    const address = params.address;

    const body = await request.json();

    const { slug, role } = body;

    if (!addressSchema.safeParse(address).success) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
    }

    if (!slugSchema.safeParse(slug).success) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    if (!roleSchema.safeParse(role).success) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const addressDoc = await AddressService.getSingleAddress(address, false);

    if (!addressDoc) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const updatedAddressDoc = await AddressService.updateAddress(address, { slug, role });

    return NextResponse.json(updatedAddressDoc, { status: 200 });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
