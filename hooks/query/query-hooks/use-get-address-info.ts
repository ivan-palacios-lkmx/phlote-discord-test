import { AddressClientService } from "@/app/client/services/address-client-service";
import Api from "@/hooks/query/api";
import { ClientAddressInfo } from "@/types/client";
import { useQuery } from "@tanstack/react-query";

export function useGetAddressInfo(address: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["addressInfo", address],
    queryFn: async (): Promise<ClientAddressInfo> => {
      const addressInfo = await Api.getAddressInfo(address);
      return {
        ...addressInfo,
        username: AddressClientService.getAddressUsername(addressInfo),
        avatar: AddressClientService.getAddressAvatar(addressInfo),
      };
    },
    enabled: enabled,
  });
}
