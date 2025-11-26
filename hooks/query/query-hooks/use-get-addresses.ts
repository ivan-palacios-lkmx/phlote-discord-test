import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetAddressesProps {
  visibility?: "public" | "private";
  role?: "admin" | "creator" | "member";
  enabled?: boolean;
}

export function useGetAddresses({ visibility, role, enabled = true }: UseGetAddressesProps = {}) {
  return useQuery({
    queryKey: ["addresses", visibility],
    queryFn: async () => {
      const addressesAndTotalCount = await Api.getAddresses(visibility, role);
      return addressesAndTotalCount;
    },
    enabled,
  });
}
