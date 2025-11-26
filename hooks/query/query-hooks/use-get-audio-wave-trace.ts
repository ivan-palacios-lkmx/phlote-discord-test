import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetAudioWaveTrace(audioId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["audioWaveTrace", audioId],
    queryFn: async () => {
      const waveTraceUrl = await Api.getAudioWaveTrace(audioId);
      if (!waveTraceUrl) return null;
      const res = await fetch(waveTraceUrl);
      const text = await res.text();
      return text;
    },
    enabled: enabled && !!audioId && audioId !== "",
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
