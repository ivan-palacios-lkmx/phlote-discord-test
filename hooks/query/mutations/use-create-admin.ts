import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface CreateAdminProps {
  address: string;
}

export function useCreateAdmin() {
  return useMutation({
    mutationFn: async ({ address }: CreateAdminProps) => {
      return await Api.createAdmin(address);
    },
  });
}
