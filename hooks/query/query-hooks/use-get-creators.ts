import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetCreatorsProps {
  visibility?: "public" | "private";
  enabled?: boolean;
}

export function useGetCreators({ visibility, enabled = true }: UseGetCreatorsProps = {}) {
  return useQuery({
    queryKey: ["creators", visibility],
    queryFn: async () => {
      const creators = await Api.getCreators(visibility);
      return creators;
    },
    enabled,
  });
}
