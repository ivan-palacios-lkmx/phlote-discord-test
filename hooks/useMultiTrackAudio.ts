"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Howl } from "howler";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useGetVersionAudio } from "./query/mutations/use-get-version-audio";
import { useRegisterSessionActivity } from "./query/mutations/use-register-session-activity";

const globalVersionPlayers = new Map<
  string,
  {
    tracks: Howl[];
    currentTrack: number;
    pauseAll: () => void;
  }
>();

let globalCurrentPlayingVersionID: string | null = null;

export function useMultiTrackAudio(
  versionID: string | null | undefined,
  sessionID: string | null | undefined,
) {
  const { mutateAsync: getVersionAudio } = useGetVersionAudio();
  const { mutate: registerActivity } = useRegisterSessionActivity();
  const pathname = usePathname();
  const { user } = usePrivy();

  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [tracks, setTracks] = useState<Howl[] | null>(null);
  const framerRef = useRef<NodeJS.Timeout | null>(null);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return playhead / duration;
  }, [duration, playhead]);

  const pauseAllTracks = () => {
    if (tracks) {
      tracks.forEach((track) => track.pause());
      setPlaying(false);
    }
  };

  useEffect(() => {
    if (!versionID || !tracks) return;

    globalVersionPlayers.set(versionID, {
      tracks,
      currentTrack,
      pauseAll: pauseAllTracks,
    });

    return () => {
      globalVersionPlayers.delete(versionID);
      if (globalCurrentPlayingVersionID === versionID) {
        globalCurrentPlayingVersionID = null;
      }
    };
  }, [versionID, tracks, currentTrack]);

  const pauseAllOtherPlayers = () => {
    globalVersionPlayers.forEach((player, id) => {
      if (id !== versionID) {
        player.pauseAll();
      }
    });
  };

  useEffect(() => {
    if (!tracks || !playing) return;

    if (framerRef.current) clearInterval(framerRef.current);

    framerRef.current = setInterval(() => {
      if (!tracks) return;
      const activeTrack = tracks[currentTrack];
      if (activeTrack && playing) {
        const seekValue = activeTrack.seek();
        if (typeof seekValue === "number") {
          setPlayhead(seekValue);
        }
      }
    }, 1000 / 10);

    return () => {
      if (framerRef.current) clearInterval(framerRef.current);
    };
  }, [currentTrack, tracks, playing]);

  const togglePlay = async () => {
    setLoading(true);
    if (!versionID || !sessionID) {
      setLoading(false);
      return;
    }

    let tracksToUse = tracks;

    if (!tracksToUse) {
      try {
        const { bounceSignedUrl: bounce, stemsSignedUrls: stems } = await getVersionAudio({
          versionID,
        });

        const howlTracks = [
          new Howl({ src: bounce, preload: true }),
          ...stems.map((stem: string) => new Howl({ src: stem, preload: true })),
        ];

        setTracks(howlTracks);
        tracksToUse = howlTracks;

        const bounceHowl = howlTracks[0];
        bounceHowl.once("load", () => setDuration(bounceHowl.duration()));
      } catch (error) {
        console.error("Error loading tracks:", error);
        setLoading(false);
        return;
      }
    }

    if (!tracksToUse) {
      setLoading(false);
      return;
    }

    tracksToUse.forEach((track) => track.pause());

    if (!playing) {
      pauseAllOtherPlayers();

      const track = tracksToUse[currentTrack];
      if (track) {
        track.play();
        track.seek(playhead);
        registerActivity({
          sessionId: sessionID,
          versionId: versionID,
          type: "PLAY",
          initiator: user?.wallet?.address || "",
        });

        globalCurrentPlayingVersionID = versionID;
        setPlaying(true);
      }
    } else {
      globalCurrentPlayingVersionID = null;
      setPlaying(false);
    }
    setLoading(false);
  };

  const switchToTrack = (newTrack: number) => {
    if (!playing || !tracks) return;

    tracks[currentTrack].pause();
    const toPlay = tracks[newTrack];
    toPlay.seek(playhead);
    toPlay.play();
    setCurrentTrack(newTrack);

    // Actualizar el estado global
    if (versionID) {
      const instance = globalVersionPlayers.get(versionID);
      if (instance) {
        instance.currentTrack = newTrack;
      }
    }
  };

  const seek = (percentage: number, trackIndex?: number) => {
    const targetTrack = trackIndex ?? currentTrack;

    if (!tracks || !duration) return;

    if (targetTrack === currentTrack && playing) {
      const track = tracks[targetTrack];
      const seekTo = percentage * duration;
      track.seek(seekTo);
      setPlayhead(seekTo);
    } else {
      switchToTrack(targetTrack);
      const track = tracks[targetTrack];
      const seekTo = percentage * duration;
      track.seek(seekTo);
      setPlayhead(seekTo);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      tracks?.forEach((track) => track.pause());
      if (framerRef.current) clearInterval(framerRef.current);
      if (globalCurrentPlayingVersionID === versionID) {
        globalCurrentPlayingVersionID = null;
      }
    };
  }, [tracks, versionID]);

  useEffect(() => {
    return () => {
      tracks?.forEach((track) => track.pause());
      if (framerRef.current) clearInterval(framerRef.current);
      if (globalCurrentPlayingVersionID === versionID) {
        globalCurrentPlayingVersionID = null;
      }
    };
  }, [pathname, tracks, versionID]);

  return {
    loading,
    playing,
    currentTrack,
    duration,
    progress,
    playhead,
    tracks,
    togglePlay,
    switchToTrack,
    seek,
    setCurrentTrack,
  };
}
