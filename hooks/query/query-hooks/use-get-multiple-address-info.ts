import { AddressClientService } from "@/app/client/services/address-client-service";
import Api from "@/hooks/query/api";
import { ClientAddressInfo, ClientAddressInfoWithPrivate } from "@/types/client";
import { useQueries } from "@tanstack/react-query";

interface UseGetMultipleAddressInfoProps {
  addresses: string[];
  includePrivate?: boolean;
  enabled?: boolean;
}

export function useGetMultipleAddressInfo({
  addresses,
  includePrivate = false,
  enabled = true,
}: UseGetMultipleAddressInfoProps) {
  return useQueries({
    queries: addresses.map((address) => {
      const isValidAddress = !!address && address.trim() !== "";

      return {
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
        enabled: enabled && isValidAddress,
      };
    }),
  });
}
