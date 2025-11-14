import Api from "@/hooks/query/api";
import { useQuery } from "@tanstack/react-query";

interface UseGetImageColorsOptions {
  imageUrl: string;
  enabled?: boolean;
}

export function useGetImageColors({ imageUrl, enabled = true }: UseGetImageColorsOptions) {
  return useQuery({
    queryKey: ["imageColors", imageUrl],
    queryFn: () => Api.getImageColors(imageUrl),
    enabled: enabled && !!imageUrl,
  });
}
