import type { HeroSlideShowSlide } from "@/types/client";
import type { SliceComponentProps } from "@prismicio/react";
import { useMemo, useState } from "react";

interface HeroSlideShowSlice {
  items?: HeroSlideShowSlide[];
}

export function useHeroSlideShow(sliceProps: SliceComponentProps) {
  const { slice } = sliceProps;
  const slideShowSlice = slice as unknown as HeroSlideShowSlice;

  const slides = useMemo<HeroSlideShowSlide[]>(() => {
    return slideShowSlice.items ?? [];
  }, [slideShowSlice.items]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const currentSlide = useMemo<HeroSlideShowSlide | undefined>(() => {
    return slides[currentSlideIndex];
  }, [slides, currentSlideIndex]);

  const currentVideoUrl = useMemo(() => {
    if (!currentSlide?.video) return "";
    return currentSlide.video.url ?? "";
  }, [currentSlide]);

  const toggleMute = () => {
    setIsMuted((m) => !m);
  };

  return {
    slides,
    currentSlideIndex,
    setCurrentSlideIndex,
    currentSlide,
    currentVideoUrl,
    isMuted,
    toggleMute,
  };
}
