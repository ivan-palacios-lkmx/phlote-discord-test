import { useQuery } from "@tanstack/react-query";

interface UseGetWaveTraceOptions {
  waveTraceUrl: string | null | undefined;
  enabled?: boolean;
}

export function useGetWaveTrace({ waveTraceUrl, enabled = true }: UseGetWaveTraceOptions) {
  return useQuery({
    queryKey: ["waveTrace", waveTraceUrl],
    queryFn: async () => {
      if (!waveTraceUrl) return null;
      const res = await fetch(waveTraceUrl);
      const text = await res.text();
      return text;
    },
    enabled: enabled && !!waveTraceUrl,
  });
}
