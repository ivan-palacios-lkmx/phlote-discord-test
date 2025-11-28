import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

export function useGetStemsCarousel() {
  return useQuery({
    queryKey: ["stems-carousel"],
    queryFn: async () => {
      const stemsCarousel = await Api.getStemsCarousel();
      return stemsCarousel;
    },
  });
}
