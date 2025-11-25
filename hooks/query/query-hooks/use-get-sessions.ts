import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetSessionsProps {
  enabled?: boolean;
}

export function useGetSessions({ enabled = true }: UseGetSessionsProps = {}) {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const sessions = await Api.getSessions();
      return sessions;
    },
    enabled,
  });
}
