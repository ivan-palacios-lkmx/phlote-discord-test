import { AddressService } from "@/services/address-service";
import { addressSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const address = request.nextUrl.pathname.split("/").pop();

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
