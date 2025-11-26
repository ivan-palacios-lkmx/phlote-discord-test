import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface DeleteCreatorProps {
  address: string;
}

export function useDeleteCreator() {
  return useMutation({
    mutationFn: async ({ address }: DeleteCreatorProps) => {
      return await Api.deleteCreator(address);
    },
  });
}
