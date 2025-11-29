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
  const animationFrameRef = useRef<number | null>(null);

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
    const setupVideoListeners = () => {
      const video = videoRef.current;
      if (!video) return;

      const handleLoadedMetadata = () => {
        const currentVideo = videoRef.current;
        if (currentVideo) {
          setDuration(currentVideo.duration);
        }
      };

      const updatePlayhead = () => {
        const currentVideo = videoRef.current;
        if (currentVideo && !currentVideo.paused) {
          setPlayhead(currentVideo.currentTime);
          animationFrameRef.current = requestAnimationFrame(updatePlayhead);
        }
      };

      const handlePlay = () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(updatePlayhead);
      };

      const handlePause = () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };

      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      if (video.readyState >= 2) {
        setDuration(video.duration);
      }

      if (!video.paused) {
        animationFrameRef.current = requestAnimationFrame(updatePlayhead);
      }

      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    };

    const timeoutId = setTimeout(setupVideoListeners, 50);
    setupVideoListeners();

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [currentVideoUrl]);

  useEffect(() => {
    setPlayhead(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
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
