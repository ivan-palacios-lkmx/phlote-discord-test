import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetSessionActivity(sessionID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["sessionActivity", sessionID],
    queryFn: async () => {
      const activity = await Api.getSessionActivity(sessionID);
      return activity;
    },
    enabled,
  });
}
