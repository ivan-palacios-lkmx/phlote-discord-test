import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface UseCheckAudioStatusProps {
  temporaryAudioFileName: string;
}

export function useCheckAudioStatus({ temporaryAudioFileName }: UseCheckAudioStatusProps) {
  const [status, setStatus] = useState<string | null>(null);
  return useQuery({
    queryFn: async () => {
      const status = await Api.getAudioProcessingStatus(temporaryAudioFileName);
      setStatus(status.status);
      return status;
    },
    queryKey: [temporaryAudioFileName],
    enabled: !!temporaryAudioFileName && status !== "ready" && status !== "failed",
    refetchInterval: 1000,
  });
}
