import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const categories = await Api.getCategories();
      return categories;
    },
  });
}
