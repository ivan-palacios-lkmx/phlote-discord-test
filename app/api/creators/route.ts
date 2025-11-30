import { AddressService } from "@/services/address-service";
import { addressSchema, visibilitySchema } from "@/utils/zod-schemas";
import { getAddress } from "ethers/address";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const visibility = searchParams.get("visibility") as "public" | "private" | undefined;

    if (visibility && !visibilitySchema.safeParse(visibility).success) {
      return NextResponse.json({ error: "Invalid visibility parameter" }, { status: 400 });
    }

    const creators = await AddressService.getCreators(visibility);

    return NextResponse.json({ creators }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const formattedAddress = getAddress(address);
    if (!formattedAddress) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }
    const addressAlreadyExists = await AddressService.getSingleAddress(formattedAddress, false);

    if (addressAlreadyExists) {
      AddressService.updateAddressRole(formattedAddress, "creator");

      return NextResponse.json({ message: "Address updated as creator" }, { status: 200 });
    }

    const addressAvatar = await AddressService.getAvatarFromExternalSources(formattedAddress);

    const creator = await AddressService.createAddress(
      formattedAddress,
      false,
      addressAvatar,
      true,
      false,
    );

    return NextResponse.json({ creator }, { status: 201 });
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
