"use client";

import OnlyMembers from "@/components/OnlyMembers/OnlyMembers";
import { useUpdatePrivateAddress } from "@/hooks/query/mutations/use-update-private-address";
import { useGetAddressPrivateInfo } from "@/hooks/query/query-hooks/use-get-address-private-info";
import { usePrivy } from "@privy-io/react-auth";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import "./connect-discord.scss";

function ConnectDiscordContent() {
  const { user } = usePrivy();
  const searchParams = useSearchParams();
  const walletAddress = user?.wallet?.address || "";

  const { data: contactDoc } = useGetAddressPrivateInfo(walletAddress, !!walletAddress);
  const { mutate: updatePrivateAddress } = useUpdatePrivateAddress();

  useEffect(() => {
    if (!walletAddress) return;

    const discordUserID = searchParams.get("id");
    const discordHandle = searchParams.get("username");
    const dmChannel = searchParams.get("dmChannel");

    if (!discordUserID || !discordHandle) return;

    updatePrivateAddress({
      address: walletAddress,
      contact: {
        id: contactDoc?.id || "",
        discordUserID,
        discordHandle,
        dmChannel: dmChannel || null,
      },
    });
  }, [walletAddress, searchParams, contactDoc?.id, updatePrivateAddress]);

  const discordHandle = contactDoc?.discordHandle;

  return (
    <OnlyMembers className="connect-discord">
      <div className="contained">
        {discordHandle && <h3>{discordHandle}</h3>}
        <h5>Your Discord has been connected</h5>
      </div>
    </OnlyMembers>
  );
}

export default function ConnectDiscordPage() {
  return (
    <Suspense fallback={null}>
      <ConnectDiscordContent />
    </Suspense>
  );
}
