import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetVersionsProps {
  sessionId: string;
  enabled?: boolean;
  index?: number;
}

export function useGetVersions({ sessionId, index, enabled = true }: UseGetVersionsProps) {
  return useQuery({
    queryKey: ["versions", sessionId],
    queryFn: async () => {
      const sessionVersions = await Api.getSessionVersions(sessionId, index);
      return sessionVersions;
    },
    enabled: !!sessionId && enabled,
  });
}
