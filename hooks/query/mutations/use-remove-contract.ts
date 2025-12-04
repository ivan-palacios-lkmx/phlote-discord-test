import Api from "@/hooks/query/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RemoveContractProps {
  contractAddress: string;
}

export function useRemoveContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contractAddress }: RemoveContractProps) => {
      return await Api.deleteContract(contractAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}
