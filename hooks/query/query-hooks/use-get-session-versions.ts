import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetSessionVersions(sessionID: string) {
  return useQuery({
    queryKey: ["sessionVersions", sessionID],
    queryFn: async () => {
      const sessionVersions = await Api.getSessionVersions(sessionID);
      return sessionVersions;
    },
    enabled: !!sessionID,
  });
}
