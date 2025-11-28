import Api from "@/hooks/query/api";
import { stemsCarouselSchema } from "@/utils/zod-schemas";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

interface UpdateStemsCarouselProps {
  stemsCarousel: z.infer<typeof stemsCarouselSchema>;
}

export function useUpdateStemsCarousel() {
  return useMutation({
    mutationFn: async ({ stemsCarousel }: UpdateStemsCarouselProps) => {
      return await Api.updateStemsCarousel(stemsCarousel);
    },
  });
}
