import { RefObject, useEffect, useState } from "react";

interface UseMediaControlsOptions {
    src?: string;
}

export function useMediaControls(
    audioRef: RefObject<HTMLAudioElement | null>,
    options: UseMediaControlsOptions = {},
) {
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Set audio src when it changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (options.src) {
            audio.src = options.src;
        }
    }, [audioRef, options.src]);

    // Set up event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setPlaying(false);

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [audioRef]);

    // Handle play/pause based on playing state
    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        if (playing) {
            audio.play();
        } else {
            audio.pause();
        }
    }, [audioRef, playing]);

    return {
        playing,
        setPlaying,
        currentTime,
        duration,
    };
}
