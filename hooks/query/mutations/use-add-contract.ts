import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface AddContractProps {
  contractAddress: string;
}

export function useAddContract() {
  return useMutation({
    mutationFn: async ({ contractAddress }: AddContractProps) => {
      return await Api.addContract(contractAddress);
    },
  });
}
