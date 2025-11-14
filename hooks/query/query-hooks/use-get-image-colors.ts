import ImageColorsService from "@/services/image-colors-service";
import { useQuery } from "@tanstack/react-query";

interface UseGetImageColorsOptions {
  imageUrl: string;
  enabled?: boolean;
}

export function useGetImageColors({ imageUrl, enabled = true }: UseGetImageColorsOptions) {
  return useQuery({
    queryKey: ["imageColors", imageUrl],
    queryFn: async () => {
      const colors = await ImageColorsService.getImageColors(imageUrl);
      return colors;
    },
    enabled: enabled && !!imageUrl,
  });
}
