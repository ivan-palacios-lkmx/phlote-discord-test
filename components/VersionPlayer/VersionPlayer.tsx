"use client";

import TrackPreview from "@/components/TrackPreview/TrackPreview";
import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import PauseIcon from "@/components/svg/pause.svg";
import PlayIcon from "@/components/svg/play.svg";
import { useGetVersionAudio } from "@/hooks/query/mutations/use-get-version-audio";
import { VersionDocWithID } from "@/types/database";
import { Howl } from "howler";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import "./VersionPlayer.scss";

interface VersionPlayerProps {
  versionData: VersionDocWithID;
}

export default function VersionPlayer({ versionData }: VersionPlayerProps) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [tracks, setTracks] = useState<Howl[] | null>(null);
  const framerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname();

  const progress = useMemo(() => {
    if (!duration) return 0;
    return playhead / duration;
  }, [duration, playhead]);

  const playerStyle = useMemo(
    () => ({
      "--progress": `${(1 - progress) * 100}%`,
    }),
    [progress],
  ) as React.CSSProperties & { "--progress": string };

  const isSoloed = useMemo(() => currentTrack > 0, [currentTrack]);

  const { mutateAsync: getVersionAudio } = useGetVersionAudio();

  const onPlay = async () => {
    setLoading(true);
    if (!versionData?.sessionID) {
      setLoading(false);
      return;
    }

    // Fetch all tracks
    if (!tracks) {
      try {
        const { bounceSignedUrl: bounce, stemsSignedUrls: stems } = await getVersionAudio({
          versionID: versionData?.id,
        });

        // Create Howl instances for each track
        const howlTracks = [
          new Howl({ src: bounce, preload: true }),
          ...stems.map((stem: string) => new Howl({ src: stem, preload: true })),
        ];

        setTracks(howlTracks);

        // Set duration once on load
        const bounceHowl = howlTracks[0];
        bounceHowl.once("load", () => setDuration(bounceHowl.duration()));

        if (framerRef.current) clearInterval(framerRef.current);

        framerRef.current = setInterval(() => {
          if (!howlTracks) return;
          const activeTrack = howlTracks[currentTrack];
          if (activeTrack) {
            setPlayhead(activeTrack.seek() as number);
          }
        }, 1000 / 10);
      } catch (error) {
        console.error("Error loading tracks:", error);
        setLoading(false);
        return;
      }
    }

    // Pause each track
    tracks?.forEach((track) => track.pause());

    // Play Current
    if (!playing) {
      const track = tracks![currentTrack];
      track.play();
      track.seek(playhead);
    }

    setPlaying(!playing);
    setLoading(false);
  };

  const switchToTrack = (newTrack: number, prevTrack: number) => {
    if (!playing || !tracks) return;

    tracks[prevTrack].pause();
    const toPlay = tracks[newTrack];
    toPlay.seek(playhead);
    toPlay.play();
    setCurrentTrack(newTrack);
  };

  const onSeek = (percentage: number, index: number) => {
    if (!tracks) return;

    // Seek current track
    if (index === currentTrack) {
      const track = tracks[index];
      const seekTo = percentage * duration;
      track.seek(seekTo);
    } else {
      switchToTrack(index, currentTrack);
    }
  };

  // Update interval when currentTrack changes
  useEffect(() => {
    if (!tracks || !framerRef.current) return;

    // Clear existing interval
    if (framerRef.current) clearInterval(framerRef.current);

    // Create new interval with updated currentTrack
    framerRef.current = setInterval(() => {
      if (!tracks) return;
      const activeTrack = tracks[currentTrack];
      if (activeTrack) {
        setPlayhead(activeTrack.seek() as number);
      }
    }, 1000 / 10);

    return () => {
      if (framerRef.current) clearInterval(framerRef.current);
    };
  }, [currentTrack, tracks]);

  // Teardown
  useEffect(() => {
    return () => {
      tracks?.forEach((track) => {
        track?.pause();
      });
      if (framerRef.current) clearInterval(framerRef.current);
    };
  }, [tracks]);

  useEffect(() => {
    // Teardown on route change
    return () => {
      tracks?.forEach((track) => {
        track?.pause();
      });
      if (framerRef.current) clearInterval(framerRef.current);
    };
  }, [pathname, tracks]);

  // Get hashes of stems and bounce
  const bounceHash = useMemo(() => versionData?.bounce, [versionData?.bounce]);
  const stems = useMemo(() => versionData?.stems || [], [versionData?.stems]);

  return (
    <div className={`version-player ${isSoloed ? "solo" : ""}`} style={playerStyle}>
      {/* Bounce */}
      <div className="bounce">
        <button className="play-pause" onClick={onPlay}>
          {loading ? <LoadingSpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        {bounceHash && (
          <TrackPreview
            hash={bounceHash}
            className={`bounce-track ${currentTrack === 0 ? "active" : ""}`}
            onSeek={(s) => onSeek(s, 0)}
          />
        )}
      </div>

      {/* Stems */}
      <div className="stems desktop-only">
        {stems.map((stem, i) => (
          <button
            key={i}
            onClick={() => switchToTrack(i + 1, currentTrack)}
            className={`stem ${currentTrack === i + 1 ? "active" : ""}`}>
            <div className="solo">
              <div className="circle" />
              <div className="line" />
            </div>

            <div className="track" onClick={(e) => e.stopPropagation()}>
              <h6>{stem.name || ""}</h6>
              {stem.id && <TrackPreview hash={stem.id} onSeek={(s) => onSeek(s, i + 1)} />}
            </div>
          </button>
        ))}
      </div>

      {/* Audio */}
      <audio ref={audioRef} />
    </div>
  );
}
