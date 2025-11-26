import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetAdminsProps {
  visibility?: "public" | "private";
  enabled?: boolean;
}

export function useGetAdmins({ visibility, enabled = true }: UseGetAdminsProps = {}) {
  return useQuery({
    queryKey: ["admins", visibility],
    queryFn: async () => {
      const admins = await Api.getAdmins(visibility);
      return admins;
    },
    enabled,
  });
}
