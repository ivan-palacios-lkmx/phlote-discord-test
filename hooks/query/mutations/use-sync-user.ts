import Api from "@/hooks/query/api";
import { SyncUserRequest, SyncUserResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSyncUser() {
  const queryClient = useQueryClient();

  return useMutation<SyncUserResponse, Error, SyncUserRequest>({
    mutationFn: (data) => Api.syncUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });
}
