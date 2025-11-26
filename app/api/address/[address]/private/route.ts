import { AddressService } from "@/services/address-service";
import { addressSchema, contactSchema, visibilitySchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } },
): Promise<NextResponse> {
  try {
    const address = params.address;

    if (!addressSchema.safeParse(address).success) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
    }

    const privateAddressData = await AddressService.getPrivateAddressData(address!);
    return NextResponse.json(privateAddressData, { status: 200 });
  } catch (error) {
    console.error("Error fetching address private data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { address: string } },
): Promise<NextResponse> {
  try {
    const address = params.address;
    const body = await request.json();
    const { contact, visibility } = body;

    if (contact && !contactSchema.safeParse(contact).success) {
      return NextResponse.json({ error: "Invalid contact format" }, { status: 400 });
    }

    if (visibility && !visibilitySchema.safeParse(visibility).success) {
      return NextResponse.json({ error: "Invalid visibility format" }, { status: 400 });
    }

    if (contact) {
      await AddressService.updatePrivateAddressData(address, contact);
    }

    if (visibility) {
      await AddressService.updateAddressVisibility(address, visibility);
    }

    return NextResponse.json({ message: "Contact updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating address private data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
