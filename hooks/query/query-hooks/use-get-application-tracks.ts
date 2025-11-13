import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetApplicationTracksOptions {
  applicationID: string;
  enabled?: boolean;
}

export function useGetApplicationTracks({ applicationID, enabled = true }: UseGetApplicationTracksOptions) {
  return useQuery({
    queryKey: ["applicationTracks", applicationID],
    queryFn: () => Api.getApplicationTracks(applicationID),
    enabled: enabled && !!applicationID,
  });
}
