import Api from "@/hooks/query/api";
import { ActivityDocWithID } from "@/types/database";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RegisterSessionActivityProps {
  sessionId: string;
  versionId: string;
  type: "PLAY" | "DOWNLOAD";
  initiator: string;
}

export function useRegisterSessionActivity() {
  const queryClient = useQueryClient();

  return useMutation<ActivityDocWithID, Error, RegisterSessionActivityProps>({
    mutationFn: async ({ sessionId, versionId, type, initiator }: RegisterSessionActivityProps) => {
      return await Api.registerSessionActivity(sessionId, versionId, type, initiator);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessionActivity", variables.sessionId] });
    },
  });
}
