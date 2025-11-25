import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetVersionsProps {
  sessionId: string;
  enabled?: boolean;
}

export function useGetVersions({ sessionId, enabled = true }: UseGetVersionsProps) {
  return useQuery({
    queryKey: ["versions", sessionId],
    queryFn: async () => {
      const sessionVersions = await Api.getSessionVersions(sessionId);
      return sessionVersions;
    },
    enabled: !!sessionId && enabled,
  });
}
