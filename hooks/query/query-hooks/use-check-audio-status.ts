import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseCheckAudioStatusProps {
  temporaryAudioFileName: string;
}

export function useCheckAudioStatus({ temporaryAudioFileName }: UseCheckAudioStatusProps) {
  return useQuery({
    queryFn: () => {
      const status = Api.getAudioProcessingStatus(temporaryAudioFileName);
      return status;
    },
    queryKey: [temporaryAudioFileName],
    enabled: !!temporaryAudioFileName,
    refetchInterval: 1000,
  });
}
