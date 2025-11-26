import { AddressService } from "@/services/address-service";
import { addressSchema, visibilitySchema } from "@/utils/zod-schemas";
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

    const addressAvatar = await AddressService.getAvatarFromExternalSources(address);

    const admin = await AddressService.createAddress(address, false, addressAvatar, false, true);

    return NextResponse.json({ admin }, { status: 200 });
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

    await AddressService.deleteAdminAddress(address);

    return NextResponse.json({ message: "Admin address deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
