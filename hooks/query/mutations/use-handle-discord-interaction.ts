import Api from "@/hooks/query/api";
import { DiscordInteractionRequest, DiscordInteractionResponse } from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useHandleDiscordInteraction() {
  const queryClient = useQueryClient();

  return useMutation<DiscordInteractionResponse, Error, DiscordInteractionRequest>({
    mutationFn: (data) => Api.handleDiscordInteraction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicationTracks"] });
    },
  });
}
