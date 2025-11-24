import Api from "@/hooks/query/api";
import { AudioProcessingStatusResponse } from "@/types/api";
import { Query, useQueries } from "@tanstack/react-query";

interface UseCheckMultipleAudioStatusProps {
  temporaryAudioFileNames: string[];
}

export function useCheckMultipleAudioStatus({
  temporaryAudioFileNames,
}: UseCheckMultipleAudioStatusProps) {
  return useQueries({
    queries: temporaryAudioFileNames.map((temporaryAudioFileName) => ({
      queryKey: ["audio-status", temporaryAudioFileName],
      queryFn: async () => {
        const status = await Api.getAudioProcessingStatus(temporaryAudioFileName);
        return status;
      },
      enabled: !!temporaryAudioFileName,
      refetchInterval: (query: Query<AudioProcessingStatusResponse>) => {
        const data = query.state.data;
        if (data?.status === "ready" || data?.status === "failed") {
          return false;
        }
        return 1000;
      },
    })),
  });
}
