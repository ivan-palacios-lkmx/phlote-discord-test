import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseSyncAddressProps {
  address: string;
  enabled?: boolean;
}

export function useSyncAddress({ address, enabled = false }: UseSyncAddressProps) {
  const isValidAddress = !!address && address.trim() !== "";

  return useQuery({
    queryKey: ["syncAddress", address],
    queryFn: async () => {
      return await Api.syncAddress(address);
    },
    enabled: enabled && isValidAddress,
  });
}
