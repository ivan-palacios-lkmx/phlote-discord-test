import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetApplicationTracksProps {
  applicationId: string;
  enabled?: boolean;
}

export function useGetApplicationTracks({
  applicationId,
  enabled = true,
}: UseGetApplicationTracksProps) {
  return useQuery({
    queryKey: ["application-tracks", applicationId],
    queryFn: async () => {
      const data = await Api.getApplicationTracks(applicationId);
      return data;
    },
    enabled: enabled && !!applicationId,
  });
}
