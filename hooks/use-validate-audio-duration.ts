import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseValidateAudioDurationProps {
  bounceHash?: string;
  stemHashes?: string[];
  enabled?: boolean;
}

export function useValidateAudioDuration({
  bounceHash,
  stemHashes,
  enabled = true,
}: UseValidateAudioDurationProps) {
  return useQuery({
    queryKey: ["validate-audio-duration", bounceHash, stemHashes],
    queryFn: async () => {
      if (!bounceHash || !stemHashes || stemHashes.length === 0) {
        return { valid: false };
      }

      const response = await Api.validateAudioDurations(bounceHash, stemHashes);
      return response;
    },
    enabled:
      enabled &&
      !!bounceHash &&
      !!stemHashes &&
      stemHashes.length > 0 &&
      stemHashes.every((hash) => !!hash),
    retry: false,
  });
}
