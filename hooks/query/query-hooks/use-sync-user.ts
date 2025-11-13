import AuthenticationService from "@/services/authentication-service";
import { SyncUserResponse } from "@/types/api";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

export function useSyncUser() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address || "";

  const query = useQuery<SyncUserResponse, Error>({
    queryKey: ["syncUser", walletAddress],
    queryFn: () => AuthenticationService.syncUser({ address: walletAddress }),
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
