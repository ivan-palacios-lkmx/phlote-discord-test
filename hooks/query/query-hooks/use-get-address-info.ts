import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetAddressInfo(address: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["addressInfo", address],
    queryFn: async () => {
      const addressInfo = await Api.getAddressInfo(address);
      return addressInfo;
    },
    enabled: enabled,
  });
}
