import { AddressService } from "@/services/address-service";
import { RoleService } from "@/services/role-service";
import {
  addressSchema,
  roleSchema,
  tagsSchema,
  titleSchema,
  visibilitySchema,
} from "@/utils/zod-schemas";
import { WriteResult } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  try {
    const visibility = searchParams.get("visibility") as "public" | "private" | undefined;
    const role = searchParams.get("role") as "admin" | "creator" | "member" | undefined;

    if (visibility && !visibilitySchema.safeParse(visibility).success) {
      return NextResponse.json({ error: "Invalid visibility parameter" }, { status: 400 });
    }

    if (role && !roleSchema.safeParse(role).success) {
      return NextResponse.json({ error: "Invalid role parameter" }, { status: 400 });
    }

    const addressesAndTotalCount = await AddressService.getAddressesAndTotalCount(visibility, role);

    return NextResponse.json(addressesAndTotalCount, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!addressSchema.safeParse(address).success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const isAddressMember = await RoleService.isMember(address);

    const addressAvatar = await AddressService.getAvatarFromExternalSources(address);

    // This handles only the onboarding process, so we only detect if the address is a member
    const newAddress = await AddressService.createAddress(
      address,
      isAddressMember,
      addressAvatar,
      false,
      false,
    );

    if (!newAddress) {
      return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
    }

    return NextResponse.json({ address: newAddress }, { status: 200 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const { address, role, title, tags, visibility } = body;

    if (!addressSchema.safeParse(address).success) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    if (
      !roleSchema.safeParse(role).success &&
      !titleSchema.safeParse(title).success &&
      !tagsSchema.safeParse(tags).success &&
      !visibilitySchema.safeParse(visibility).success
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let updatedAddress: WriteResult | null = null;

    if (role) {
      updatedAddress = await AddressService.updateAddressRole(address, role);
    }

    if (title) {
      updatedAddress = await AddressService.updateAddressTitle(address, title);
    }

    if (tags) {
      updatedAddress = await AddressService.updateAddressTags(address, tags);
    }

    if (visibility) {
      updatedAddress = await AddressService.updateAddressVisibility(address, visibility);
    }

    if (!updatedAddress) {
      return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
    }

    return NextResponse.json({ message: "Address updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
