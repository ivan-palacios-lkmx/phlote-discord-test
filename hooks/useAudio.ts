"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Howl } from "howler";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useGetVersionAudio } from "./query/mutations/use-get-version-audio";
import { useRegisterSessionActivity } from "./query/mutations/use-register-session-activity";

// Global state for tracks and currentPlaying
// Using module-level state to share across components
const globalTracks: Howl[] = [];
let globalCurrentPlaying: number | null = null;

/**
 * Hook for audio playback using Howler.js
 * Manages audio playback state, loading, and controls for a version
 *
 * @param versionID - Version ID (can be string, null, or undefined)
 * @returns Object with src, trackID, loading, playing, duration, progress, togglePlay, and seek
 *
 * @example
 * ```tsx
 * const { loading, playing, progress, togglePlay, seek } = useAudio("version123");
 *
 * return (
 *   <div>
 *     <button onClick={togglePlay}>{playing ? "Pause" : "Play"}</button>
 *     <input type="range" value={progress} onChange={(e) => seek(parseFloat(e.target.value))} />
 *   </div>
 * );
 * ```
 */
export default function useAudio(
  versionID: string | null | undefined,
  sessionID: string | null | undefined,
) {
  const { mutateAsync: getVersionAudio } = useGetVersionAudio();
  const { mutate: registerActivity } = useRegisterSessionActivity();
  const pathname = usePathname();
  const { user } = usePrivy();
  const [src, setSrc] = useState<string | null>(null);
  const [trackID, setTrackID] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [playhead, setPlayhead] = useState(0);

  const framerRef = useRef<NodeJS.Timeout | null>(null);

  // Safe ID - handle both ref-like objects and plain values
  const safeID = useMemo(() => {
    if (!versionID) return null;
    // Check if it's an object with a value property (like a ref)
    if (typeof versionID === "object" && "value" in versionID) {
      return (versionID as { value: string }).value;
    }
    return versionID;
  }, [versionID]);

  // Fetch audio src from version (bounce)
  const fetchSrc = async (vid: string): Promise<string | null> => {
    try {
      const { bounceSignedUrl: bounce } = await getVersionAudio({
        versionID: vid,
      });
      setSrc(bounce);
      return bounce;
    } catch (err) {
      console.error("Error fetching audio src:", err);
      return null;
    }
  };

  // Update playing state based on currentPlaying
  // Check periodically since globalCurrentPlaying is not reactive
  useEffect(() => {
    const checkPlayingState = () => {
      if (globalCurrentPlaying === null) {
        setPlaying(false);
      } else {
        setPlaying(globalCurrentPlaying === trackID);
      }
    };

    checkPlayingState();
    const interval = setInterval(checkPlayingState, 100);

    return () => clearInterval(interval);
  }, [trackID]);

  // Progress computed value
  const progress = useMemo(() => {
    if (!duration) return 0;
    return playhead / duration;
  }, [duration, playhead]);

  // Toggle playing of track
  const togglePlay = async () => {
    setLoading(true);

    // Fetch src if needed and get the value directly
    let currentSrc = src;
    if (!currentSrc && safeID) {
      currentSrc = await fetchSrc(safeID);
      if (!currentSrc) {
        setLoading(false);
        return;
      }
    }

    // Create track if needed, using the current src value
    let currentTrackID = trackID;
    if (!currentTrackID && currentSrc) {
      const newTrack = new Howl({
        src: currentSrc,
      });
      globalTracks.push(newTrack);
      const newTrackID = globalTracks.length - 1;
      setTrackID(newTrackID);
      currentTrackID = newTrackID;
    }

    const track = globalTracks[currentTrackID ?? globalTracks.length - 1];

    if (!track) {
      setLoading(false);
      return;
    }

    if (!duration) {
      track.once("load", () => {
        const trackDuration = track.duration();
        setDuration(trackDuration);
        setLoading(false);
      });
      track.on("end", () => setPlaying(false));
    }

    // Clear existing framer interval
    if (framerRef.current) {
      clearInterval(framerRef.current);
    }

    // Set up framer to update playhead
    framerRef.current = setInterval(() => {
      const seekValue = track.seek();
      if (typeof seekValue === "number") {
        setPlayhead(seekValue);
      }
    }, 1000 / 10);

    // Pause all tracks
    globalTracks.forEach((t) => {
      t.pause();
    });

    // Reset current playing state
    globalCurrentPlaying = null;

    if (!playing) {
      track.play();
      registerActivity({
        sessionId: sessionID || "",
        versionId: versionID || "",
        type: "PLAY",
        initiator: user?.wallet?.address || "",
      });
      const currentSeek = track.seek();
      if (typeof currentSeek === "number") {
        track.seek(playhead);
      }
      globalCurrentPlaying = currentTrackID ?? globalTracks.length - 1;
      setPlaying(true);
    } else {
      setPlaying(false);
    }

    setLoading(false);
  };

  // Seek
  const seek = (percentage: number) => {
    if (!playing) return;

    try {
      const currentTrackID = trackID ?? globalTracks.length - 1;
      const track = globalTracks[currentTrackID];

      if (!track) throw new Error("No valid track");
      if (!duration) throw new Error("No duration set");

      const seekTime = percentage * duration;
      track.seek(seekTime);
      setPlayhead(seekTime);
    } catch (err) {
      console.error("Error seeking track:", err);
    }
  };

  // Teardown function
  const teardown = () => {
    globalTracks.forEach((track) => {
      track.pause();
    });

    if (framerRef.current) {
      clearInterval(framerRef.current);
      framerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return teardown;
  }, []);

  // Cleanup on route change
  useEffect(() => {
    teardown();
  }, [pathname]);

  return {
    src,
    trackID,
    loading,
    playing,
    duration,
    progress,
    togglePlay,
    seek,
  };
}
