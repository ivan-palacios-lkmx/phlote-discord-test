import { GlobalsService } from "@/services/globals-service";
import { addressSchema } from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { contractAddress } = body;
  try {
    if (!contractAddress) {
      return NextResponse.json({ error: "Contract address is required" }, { status: 400 });
    }

    if (!addressSchema.safeParse(contractAddress).success) {
      return NextResponse.json({ error: "Invalid contract address" }, { status: 400 });
    }

    await GlobalsService.addMembershipContract(contractAddress);

    // For now, the members being added to the contract will be synced in the address/[address]/sync route

    return NextResponse.json({ message: "Contract added" }, { status: 200 });
  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
