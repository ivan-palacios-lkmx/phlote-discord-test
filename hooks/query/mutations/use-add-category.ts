import Api from "@/hooks/query/api";
import { TagCategory } from "@/types/database";
import { useMutation } from "@tanstack/react-query";

interface AddCategoryProps {
  category: TagCategory;
  categoryType: "member" | "session";
}

export function useAddCategory() {
  return useMutation({
    mutationFn: async ({ category, categoryType }: AddCategoryProps) => {
      return await Api.createTagCategory(category, categoryType);
    },
  });
}
