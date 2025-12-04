import Api from "@/hooks/query/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AddContractProps {
  contractAddress: string;
}

export function useAddContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contractAddress }: AddContractProps) => {
      return await Api.addContract(contractAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
}
