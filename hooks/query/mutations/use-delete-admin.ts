import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface DeleteAdminProps {
  address: string;
}

export function useDeleteAdmin() {
  return useMutation({
    mutationFn: async ({ address }: DeleteAdminProps) => {
      return await Api.deleteAdmin(address);
    },
  });
}
