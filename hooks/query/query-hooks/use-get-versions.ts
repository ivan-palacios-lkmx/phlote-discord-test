import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetVersions(sessionID: string, enabled = true) {
  return useQuery({
    queryKey: ["versions", sessionID],
    queryFn: async () => {
      const sessionVersions = await Api.getSessionVersions(sessionID);
      return sessionVersions;
    },
    enabled: !!sessionID && enabled,
  });
}
