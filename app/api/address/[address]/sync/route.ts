import { AddressService } from "@/services/address-service";
import { RoleService } from "@/services/role-service";
import { addressSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;
  try {
    if (!addressSchema.safeParse(address).success) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
    }

    const addressDoc = await AddressService.getSingleAddress(address, false);

    if (!addressDoc) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const isAddressAMember = await RoleService.isMember(address);

    const addressWasAMember = addressDoc.isMember ?? false;

    // Both of this conditions will update the updated timestamp of the address doc, so
    // the cron job will not run again for this address until the next day.
    if (addressWasAMember && !isAddressAMember) {
      await AddressService.removeRoleFromAddress(address, "member");
      return NextResponse.json({ message: "Address is not a member" }, { status: 200 });
    }

    if (!addressWasAMember && isAddressAMember) {
      await AddressService.addRoleToAddress(address, "member");
      return NextResponse.json({ message: "Address is now a member" }, { status: 200 });
    }

    return NextResponse.json({ message: "Address status is unchanged" }, { status: 200 });
  } catch (error) {
    console.error("Error syncing address:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
