import Api from "@/hooks/query/api";
import { SyncUserResponse } from "@/types/api";
import type { AddressDoc } from "@/types/client";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

export function useSyncUser() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address || "";

  const query = useQuery<SyncUserResponse, Error>({
    queryKey: ["syncUser", walletAddress],
    queryFn: () => Api.syncUser({ address: walletAddress }),
    enabled: !!user?.wallet?.address,
    staleTime: FIVE_MINUTES_IN_MS,
    refetchInterval: FIVE_MINUTES_IN_MS,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    addressDoc: query.data || null,
  };
}
