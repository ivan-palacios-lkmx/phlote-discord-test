import Api from "@/hooks/query/api";
import { ContactDocWithID } from "@/types/database";
import { useQuery } from "@tanstack/react-query";

export function useGetAddressPrivateInfo(address: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ["addressPrivateInfo", address],
    queryFn: async (): Promise<ContactDocWithID> => {
      const addressPrivateInfo = await Api.getAddressPrivateInfo(address);
      return addressPrivateInfo;
    },
    enabled: enabled,
  });
}
