import { AddressService } from "@/services/address-service";
import {
  addressSchema,
  contactSchema,
  discordHandleSchema,
  discordUserIDSchema,
  dmChannelSchema,
  emailSchema,
  nameSchema,
  twitterHandleSchema,
  visibilitySchema,
} from "@/utils/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
): Promise<NextResponse> {
  try {
    const { address } = await params;

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
): Promise<NextResponse> {
  try {
    const { address } = await params;
    const body = await request.json();
    const { name, twitterHandle, email, discordUserID, discordHandle, dmChannel } = body;

    console.log("name", name);
    console.log("twitterHandle", twitterHandle);
    console.log("email", email);
    console.log("discordUserID", discordUserID);
    console.log("discordHandle", discordHandle);
    console.log("dmChannel", dmChannel);

    if (name && !nameSchema.safeParse(name).success) {
      console.log("Invalid name");
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (twitterHandle && !twitterHandleSchema.safeParse(twitterHandle).success) {
      console.log("Invalid twitter handle");
      return NextResponse.json({ error: "Invalid twitter handle" }, { status: 400 });
    }
    if (email && !emailSchema.safeParse(email).success) {
      console.log("Invalid email");
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (discordUserID && !discordUserIDSchema.safeParse(discordUserID).success) {
      console.log("Invalid discord user ID");
      return NextResponse.json({ error: "Invalid discord user ID" }, { status: 400 });
    }
    if (discordHandle && !discordHandleSchema.safeParse(discordHandle).success) {
      console.log("Invalid discord handle");
      return NextResponse.json({ error: "Invalid discord handle" }, { status: 400 });
    }
    if (dmChannel && !dmChannelSchema.safeParse(dmChannel).success) {
      console.log("Invalid dm channel");
      return NextResponse.json({ error: "Invalid dm channel" }, { status: 400 });
    }

    console.log("success");
    await AddressService.updatePrivateAddressData(
      address,
      name ?? null,
      twitterHandle ?? null,
      email ?? null,
      discordUserID ?? null,
      discordHandle ?? null,
      dmChannel ?? null,
    );

    return NextResponse.json({ message: "Contact updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating address private data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
