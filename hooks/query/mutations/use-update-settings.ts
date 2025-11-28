import Api from "@/hooks/query/api";
import { stemsCarouselSchema } from "@/utils/zod-schemas";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

interface UpdateSettingsProps {
  stemsCarousel: z.infer<typeof stemsCarouselSchema>;
}

export function useUpdateSettings() {
  return useMutation({
    mutationFn: async ({ stemsCarousel }: UpdateSettingsProps) => {
      return await Api.putSettings({ stemsCarousel });
    },
  });
}
