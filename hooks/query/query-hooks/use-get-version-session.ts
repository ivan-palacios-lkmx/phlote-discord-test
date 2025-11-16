import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetVersionSession(versionID: string) {
  return useQuery({
    queryKey: ["versionSession", versionID],
    queryFn: async () => {
      const version = await Api.getSessionVersion(versionID);
      return version;
    },
  });
}
