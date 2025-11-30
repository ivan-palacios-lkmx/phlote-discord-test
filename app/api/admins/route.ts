import { AddressService } from "@/services/address-service";
import { PrivyService } from "@/services/privy-service";
import { addressSchema, visibilitySchema } from "@/utils/zod-schemas";
import { getAddress } from "ethers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const visibility = searchParams.get("visibility") as "public" | "private" | undefined;

    if (visibility && !visibilitySchema.safeParse(visibility).success) {
      return NextResponse.json({ error: "Invalid visibility parameter" }, { status: 400 });
    }

    const admins = await AddressService.getAdmins(visibility);

    return NextResponse.json({ admins }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const addressAvatar = await AddressService.getAvatarFromExternalSources(address);

    const addressAlreadyExists = await AddressService.getSingleAddress(address, false);

    if (addressAlreadyExists) {
      AddressService.updateAddressRole(formattedAddress, "admin");
      await PrivyService.setPrivyUserRoleByWalletAddress(formattedAddress, "admin");
      return NextResponse.json({ message: "Address updated as admin" }, { status: 201 });
    }

    const newAdmin = await AddressService.createAddress(
      formattedAddress,
      false,
      addressAvatar,
      false,
      true,
    );

    await PrivyService.setPrivyUserRoleByWalletAddress(formattedAddress, "admin");

    return NextResponse.json({ admin: newAdmin }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    if (!addressSchema.safeParse(address).success) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    const addressDoc = await AddressService.getSingleAddress(address, false);

    if (!addressDoc) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await AddressService.deleteAdminAddress(address);

    await PrivyService.setPrivyUserRoleByWalletAddress(
      address,
      addressDoc.isCreator ? "creator" : addressDoc.isMember ? "member" : "",
    );

    return NextResponse.json({ message: "Admin address deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
