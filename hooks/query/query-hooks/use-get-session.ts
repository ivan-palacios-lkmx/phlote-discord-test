import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetSession(sessionID: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["session", sessionID],
    queryFn: async () => {
      const session = await Api.getSession(sessionID);
      return session;
    },
    enabled,
  });
}
