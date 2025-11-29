import { useGetWaveTrace } from "@/hooks/query/query-hooks/use-get-wave-trace";
import { useClientDoc } from "@/hooks/useClientDoc";
import { db } from "@/lib/firebase";
import type { HeroSlideShowSlide } from "@/types/client";
import { quickHash } from "@/utils/functions";
import type { SliceComponentProps } from "@prismicio/react";
import { doc } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const [duration, setDuration] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentSlide = useMemo<HeroSlideShowSlide | undefined>(() => {
    return slides[currentSlideIndex];
  }, [slides, currentSlideIndex]);

  const currentVideoUrl = useMemo(() => {
    if (!currentSlide?.video) return "";
    return currentSlide.video.url ?? "";
  }, [currentSlide]);

  const slideUrlHash = useMemo(() => {
    const url = currentSlide?.video?.url;
    if (!url) return "";
    return quickHash(url);
  }, [currentSlide?.video?.url]);

  const audioDocRef = useMemo(() => {
    if (!slideUrlHash) return null;
    return doc(db, `public-audio/${slideUrlHash}`);
  }, [slideUrlHash]);

  const audioDoc = useClientDoc(audioDocRef);

  const hash = (audioDoc?.hash as string | undefined) ?? null;

  const waveTraceUrl = (audioDoc?.waveTrace as string | undefined) ?? null;
  const { data: waveTrace } = useGetWaveTrace({
    waveTraceUrl,
    enabled: !!waveTraceUrl,
  });

  const progress = useMemo(() => {
    if (!duration) return 0;
    return playhead / duration;
  }, [duration, playhead]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setupVideoListeners = () => {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        const currentVideo = videoRef.current;
        if (currentVideo) {
          setPlayhead(currentVideo.currentTime);
        }
      };

      const handleLoadedMetadata = () => {
        const currentVideo = videoRef.current;
        if (currentVideo) {
          setDuration(currentVideo.duration);
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      if (video.readyState >= 2) {
        setDuration(video.duration);
      }

      cleanup = () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    };

    const timeoutId = setTimeout(setupVideoListeners, 50);
    setupVideoListeners();

    return () => {
      clearTimeout(timeoutId);
      cleanup?.();
    };
  }, [currentVideoUrl]);

  useEffect(() => {
    setPlayhead(0);
  }, [currentSlideIndex]);

  const toggleMute = () => {
    setIsMuted((m) => !m);
  };

  const goToNextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlideIndex((prevIndex) => {
      const nextSlideIndex = (prevIndex + 1) % slides.length;
      return nextSlideIndex;
    });
  };

  return {
    slides,
    currentSlideIndex,
    setCurrentSlideIndex,
    currentSlide,
    currentVideoUrl,
    isMuted,
    toggleMute,
    goToNextSlide,
    hash,
    waveTrace,
    progress,
    videoRef,
  };
}
