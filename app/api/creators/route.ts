import { AddressService } from "@/services/address-service";
import { addressSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    if (!addressSchema.safeParse(address).success) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    const addressAvatar = await AddressService.getAvatarFromExternalSources(address);

    const creator = await AddressService.createAddress(address, false, addressAvatar, true, false);

    return NextResponse.json({ creator }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    if (!addressSchema.safeParse(address).success) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    await AddressService.deleteCreatorAddress(address);

    return NextResponse.json({ message: "Creator address deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
