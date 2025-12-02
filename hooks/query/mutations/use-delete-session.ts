import Api from "@/hooks/query/api";
import { useMutation } from "@tanstack/react-query";

interface DeleteSessionProps {
  sessionId: string;
}

export function useDeleteSession() {
  return useMutation({
    mutationFn: async ({ sessionId }: DeleteSessionProps) => {
      return await Api.deleteSession(sessionId);
    },
  });
}
