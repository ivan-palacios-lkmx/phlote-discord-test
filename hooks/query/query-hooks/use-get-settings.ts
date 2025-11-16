import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const settings = await Api.getSettings();
      return settings;
    },
  });
}
