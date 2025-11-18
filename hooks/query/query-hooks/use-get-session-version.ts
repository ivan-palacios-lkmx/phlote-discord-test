import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetSessionVersion(
  sessionID: string,
  versionID: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["sessionVersion", sessionID, versionID],
    queryFn: async () => {
      const version = await Api.getSessionVersion(sessionID, versionID);
      return version;
    },
    enabled: enabled,
  });
}
