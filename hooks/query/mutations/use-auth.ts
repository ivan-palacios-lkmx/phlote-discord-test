import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

export function useAuth() {
  return useMutation({
    mutationFn: async (address: string) => {
      const response = await Api.auth(address);
      return response;
    },
  });
}
