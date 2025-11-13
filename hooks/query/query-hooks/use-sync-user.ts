import Api from "@/hooks/query/api";
import { SyncUserResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

interface UseSyncUserOptions {
  address: string;
  enabled?: boolean;
}

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

export function useSyncUser({ address, enabled = true }: UseSyncUserOptions) {
  return useQuery<SyncUserResponse, Error>({
    queryKey: ["syncUser", address],
    queryFn: () => Api.syncUser({ address }),
    enabled: enabled && !!address,
    staleTime: FIVE_MINUTES_IN_MS,
    refetchInterval: FIVE_MINUTES_IN_MS,
    refetchOnWindowFocus: false,
  });
}
