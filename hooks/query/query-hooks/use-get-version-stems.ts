import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetVersionStemsOptions {
  versionID: string;
  action?: string;
  enabled?: boolean;
}

export function useGetVersionStems({
  versionID,
  action = "play",
  enabled = true,
}: UseGetVersionStemsOptions) {
  return useQuery({
    queryKey: ["versionStems", versionID, action],
    queryFn: () => Api.getVersionStems(versionID, action),
    enabled: enabled && !!versionID,
  });
}
