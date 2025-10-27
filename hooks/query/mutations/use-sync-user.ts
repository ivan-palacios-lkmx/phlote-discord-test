import { useMutation, useQueryClient } from "@tanstack/react-query";

import Api from "../api";
import { SyncUserRequest, SyncUserResponse } from "@/types/api";

export function useSyncUser() {
  const queryClient = useQueryClient();

  return useMutation<SyncUserResponse, Error, SyncUserRequest>({
    mutationFn: (data) => Api.syncUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });
}
