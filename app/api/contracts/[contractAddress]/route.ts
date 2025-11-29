import { GlobalsService } from "@/services/globals-service";
import { addressSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ contractAddress: string }> },
) {
  const { contractAddress } = await params;
  try {
    if (!contractAddress) {
      return NextResponse.json({ error: "Contract address is required" }, { status: 400 });
    }

    if (!addressSchema.safeParse(contractAddress).success) {
      return NextResponse.json({ error: "Invalid contract address" }, { status: 400 });
    }

    await GlobalsService.removeMembershipContract(contractAddress);

    // For now, the members being removed from the contract will be synced in the address/[address]/sync route

    return NextResponse.json({ message: "Contract address removed" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting contract address:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
