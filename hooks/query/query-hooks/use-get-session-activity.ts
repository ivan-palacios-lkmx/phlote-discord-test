import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetSessionActivity(
  sessionID: string,
  enabled: boolean = true,
  initiator?: string,
  type?: "PLAY" | "DOWNLOAD",
) {
  return useQuery({
    queryKey: ["sessionActivity", sessionID, initiator, type],
    queryFn: async () => {
      const activity = await Api.getSessionActivity(sessionID, initiator, type);
      return activity;
    },
    enabled,
  });
}
