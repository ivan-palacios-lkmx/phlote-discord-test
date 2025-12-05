import { AddressService } from "@/services/address-service";
import { RoleService } from "@/services/role-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { address } = body;
  try {
    const existingAddress = await AddressService.getSingleAddress(address);

    if (existingAddress) {
      return NextResponse.json({ address: existingAddress }, { status: 200 });
    }

    const isAddressMember = await RoleService.isMember(address);

    const addressAvatar = await AddressService.getAvatarFromExternalSources(address);

    const newAddress = await AddressService.createAddress(
      address,
      isAddressMember,
      addressAvatar,
      false,
      false,
    );

    if (!newAddress) {
      return NextResponse.json({ message: "Failed to sign up" }, { status: 500 });
    }

    return NextResponse.json({ address: newAddress }, { status: 200 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json({ message: "Failed to create address" }, { status: 500 });
  }
}
