import { useQuery } from "@tanstack/react-query";

import Api from "../api";

interface UseGetAccountOptions {
  address: string;
  enabled?: boolean;
}

export function useGetAccount({ address, enabled = true }: UseGetAccountOptions) {
  return useQuery({
    queryKey: ["account", address],
    queryFn: () => Api.getAccount(address),
    enabled: enabled && !!address,
  });
}
