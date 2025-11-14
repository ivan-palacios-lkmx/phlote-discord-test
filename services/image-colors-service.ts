import Api from "@/hooks/query/api";
import { ImageColorsResponse } from "@/types/api";

class ImageColorsService {
  static async getImageColorsFromEndpoint(imageUrl: string) {
    return await Api.getImageColors(imageUrl);
  }

  static async getImageColors(imageUrl: string): Promise<ImageColorsResponse> {
    try {
      const colorsFromEndpoint = await this.getImageColorsFromEndpoint(imageUrl);
      const colors = colorsFromEndpoint?.dominant_colors;
      const primary = colors?.vibrant_dark?.hex || "";
      const secondary = colors?.muted_dark?.hex || "";

      return {
        ...colorsFromEndpoint,
        primary,
        secondary,
      };
    } catch (error) {
      console.error("Error fetching image colors:", error);
      throw error;
    }
  }
}

export default ImageColorsService;
