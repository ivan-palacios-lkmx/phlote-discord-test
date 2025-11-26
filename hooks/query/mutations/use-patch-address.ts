import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface PatchAddressProps {
  address: string;
  role?: string;
  title?: string;
  tags?: string[];
  visibility?: "public" | "private";
}

export function usePatchAddress() {
  return useMutation({
    mutationFn: async (data: PatchAddressProps) => {
      return await Api.patchAddress(data);
    },
  });
}
