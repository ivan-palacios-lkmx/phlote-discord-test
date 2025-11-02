import type { UnknownSlice } from "@/types/client";
import { normalizeSlideItems } from "@/utils/functions";
import type { SliceComponentProps } from "@prismicio/react";
import { useMemo, useState } from "react";

export function useHeroSlideShow(sliceProps: SliceComponentProps) {
  const { slice } = sliceProps;
  const rawSliceItems = (slice as unknown as { items?: unknown[] }).items;
  const slides = useMemo<UnknownSlice[]>(
    () => normalizeSlideItems<UnknownSlice>(rawSliceItems),
    [rawSliceItems],
  );

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const currentSlide = useMemo<UnknownSlice>(() => {
    if (!slides[currentSlideIndex]) return {};
    return slides[currentSlideIndex];
  }, [slides, currentSlideIndex]);

  const currentVideoUrl = useMemo(() => {
    if (!currentSlide) return "";
    const video = currentSlide.video as UnknownSlice | undefined;
    const videoUrl = (video?.url as string | undefined) ?? "";
    return videoUrl;
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
