import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetTagsProps {
  category: "member" | "session";
  enabled?: boolean;
}

export function useGetTags({ category, enabled = true }: UseGetTagsProps) {
  return useQuery({
    queryKey: ["tags", category],
    queryFn: async () => {
      const tags = await Api.getTags(category);
      return tags;
    },
    enabled,
  });
}
