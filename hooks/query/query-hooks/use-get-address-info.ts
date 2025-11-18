import { AddressClientService } from "@/app/client/services/address-client-service";
import Api from "@/hooks/query/api";
import { ClientAddressInfo, ClientAddressInfoWithPrivate } from "@/types/client";
import { useQuery } from "@tanstack/react-query";

export function useGetAddressInfo(
  address: string,
  includePrivate: boolean = false,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["addressInfo", address],
    queryFn: async (): Promise<ClientAddressInfo | ClientAddressInfoWithPrivate> => {
      const addressInfo = await Api.getAddressInfo(address, includePrivate);
      return {
        ...addressInfo,
        username: AddressClientService.getAddressUsername(addressInfo),
        avatar: AddressClientService.getAddressAvatar(addressInfo),
        title: AddressClientService.getAddressTitle(addressInfo),
      };
    },
    enabled: enabled,
  });
}
