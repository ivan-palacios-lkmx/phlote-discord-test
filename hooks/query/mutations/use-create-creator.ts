import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface CreateCreatorProps {
  address: string;
}

export function useCreateCreator() {
  return useMutation({
    mutationFn: async ({ address }: CreateCreatorProps) => {
      return await Api.createCreator(address);
    },
  });
}
