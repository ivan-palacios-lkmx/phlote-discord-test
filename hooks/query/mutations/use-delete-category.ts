import Api from "@/hooks/query/api";
import { TagCategory } from "@/types/database";
import { useMutation } from "@tanstack/react-query";

interface DeleteCategoryProps {
  category: TagCategory;
  categoryType: "member" | "session";
}

export function useDeleteCategory() {
  return useMutation({
    mutationFn: async ({ category, categoryType }: DeleteCategoryProps) => {
      return await Api.deleteTagCategory(category, categoryType);
    },
  });
}
