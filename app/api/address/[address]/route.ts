import { AddressService } from "@/services/address-service";
import { addressSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!addressSchema.safeParse(address).success) {
    return NextResponse.json({ error: "Invalid address parameter" }, { status: 400 });
  }

  const addressDoc = await AddressService.getSingleAddress(address!);

  return NextResponse.json(addressDoc, { status: 200 });
}
