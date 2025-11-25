import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetAddressesProps {
  visibility?: "public" | "private";
  enabled?: boolean;
}

export function useGetAddresses({ visibility, enabled = true }: UseGetAddressesProps = {}) {
  return useQuery({
    queryKey: ["addresses", visibility],
    queryFn: async () => {
      const addressesAndTotalCount = await Api.getAddresses(visibility);
      return addressesAndTotalCount;
    },
    enabled,
  });
}
