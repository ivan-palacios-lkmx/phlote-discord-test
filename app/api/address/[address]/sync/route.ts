import { AddressService } from "@/services/address-service";
import { PrivyService } from "@/services/privy-service";
import { RoleService } from "@/services/role-service";
import { addressSchema } from "@/utils/zod-schemas";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;

  try {
    const cookiesStore = await cookies();
    const privyIdToken = cookiesStore.get("privy-id-token")?.value;
    if (!addressSchema.safeParse(address).success) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
    }

    const addressDoc = await AddressService.getSingleAddress(address, false);

    if (!addressDoc) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // TODO: Check if there is any rate limit for this endpoint
    const privyRole = addressDoc.isAdmin
      ? "admin"
      : addressDoc.isCreator
        ? "creator"
        : addressDoc.isMember
          ? "member"
          : "";
    await PrivyService.setPrivyUserRoleByToken(privyIdToken!, privyRole);

    const isAddressAMember = await RoleService.isMember(address);

    const addressWasAMember = addressDoc.isMember ?? false;

    // Both of this conditions will update the updated timestamp of the address doc, so
    // the cron job will not run again for this address until the next day.
    // The cron job will be searching for addresses that have been updated in the last day and are members.
    if (addressWasAMember && !isAddressAMember) {
      await AddressService.removeRoleFromAddress(address, "member");
      const privyRole = addressDoc.isAdmin ? "admin" : addressDoc.isCreator ? "creator" : "";
      await PrivyService.setPrivyUserRoleByToken(privyIdToken!, privyRole);
      return NextResponse.json(
        { address, isMember: false, syncStatus: "updated" },
        { status: 200 },
      );
    }

    if (!addressWasAMember && isAddressAMember) {
      await AddressService.addRoleToAddress(address, "member");
      const privyRole = addressDoc.isAdmin ? "admin" : addressDoc.isCreator ? "creator" : "member";
      await PrivyService.setPrivyUserRoleByToken(privyIdToken!, privyRole);
      return NextResponse.json({ address, isMember: true, syncStatus: "updated" }, { status: 200 });
    }

    return NextResponse.json(
      { address, isMember: addressWasAMember, syncStatus: "unchanged" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error syncing address:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
