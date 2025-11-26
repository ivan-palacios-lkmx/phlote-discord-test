import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetAudioWaveTrace(audioId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["audioWaveTrace", audioId],
    queryFn: async () => {
      const audio = await Api.getAudioWaveTrace(audioId);
      console.log("Audio wave trace:", audio);
      return audio;
    },
    enabled,
  });
}
