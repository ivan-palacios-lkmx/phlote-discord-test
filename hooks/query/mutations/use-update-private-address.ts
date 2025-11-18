import Api from "@/hooks/query/api";
import { ContactDocWithID } from "@/types/database";
import { useMutation } from "@tanstack/react-query";

interface UpdatePrivateAddressProps {
  address: string;
  contact: ContactDocWithID;
}

export function useUpdatePrivateAddress() {
  return useMutation({
    mutationFn: async ({ address, contact }: UpdatePrivateAddressProps) => {
      return await Api.updatePrivateAddressData(address, contact);
    },
  });
}
