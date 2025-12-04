import Api from "@/hooks/query/api";
import { TagCategory } from "@/types/database";
import { useMutation } from "@tanstack/react-query";

interface UpdateTagsProps {
  categories: TagCategory[];
  category: "member" | "session";
}

export function useUpdateTags() {
  return useMutation({
    mutationFn: async ({ categories, category }: UpdateTagsProps) => {
      return await Api.updateTags(categories, category);
    },
  });
}

