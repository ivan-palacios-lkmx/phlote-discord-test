import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetVersion(versionID: string) {
  return useQuery({
    queryKey: ["version", versionID],
    queryFn: async () => {
      const version = await Api.getVersion(versionID);
      return version;
    },
  });
}
