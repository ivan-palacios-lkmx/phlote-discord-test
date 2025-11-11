"use client";

import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import PauseIcon from "@/components/svg/pause.svg";
import PlayIcon from "@/components/svg/play.svg";
// import { useFbEndpoints } from "@/hooks/useFbEndpoints";
import { Howl } from "howler";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import TrackPreview from "../../../TrackPreview/TrackPreview";

interface VersionPlayerProps {
  versionData: {
    id?: string;
    bounce?: string;
    stems?: Array<{ name?: string; id?: string }>;
    [key: string]: unknown;
  } | null;
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

  const versionID = useMemo(() => versionData?.id, [versionData?.id]);

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

  // TODO: Uncomment when useFbEndpoints is implemented
  // const { getVersionStems } = useFbEndpoints();

  const onPlay = async () => {
    setLoading(true);
    if (!versionID) {
      setLoading(false);
      return;
    }

    // Fetch all tracks
    if (!tracks) {
      try {
        // TODO: Uncomment when useFbEndpoints is implemented
        // const { bounce, stems } = await getVersionStems({
        //   versionID: versionID,
        // });

        // Placeholder values until useFbEndpoints is implemented
        const bounce = "";
        const stems: string[] = [];

        // Create Howl instances for each track
        const howlTracks = [
          new Howl({ src: bounce, preload: true }),
          ...stems.map((stem) => new Howl({ src: stem, preload: true })),
        ];

        setTracks(howlTracks);

        // Set duration once on load
        const bounceHowl = howlTracks[0];
        bounceHowl.once("load", () => setDuration(bounceHowl.duration()));

        if (framerRef.current) clearInterval(framerRef.current);

        framerRef.current = setInterval(() => {
          if (!howlTracks) return;
          const activeTrack = howlTracks[currentTrack];
          if (activeTrack && activeTrack.playing()) {
            setPlayhead(activeTrack.seek() as number);
          }
        }, 1000 / 10);
      } catch (error) {
        console.error("Error loading tracks:", error);
      }
    }

    // Pause each track
    tracks?.forEach((track) => track.pause());

    // Play Current
    if (!playing && tracks) {
      const track = tracks[currentTrack];
      track.play();
      track.seek(playhead);
    }

    setPlaying(!playing);
    setLoading(false);
  };

  const switchToTrack = (newTrack: number) => {
    if (!playing || !tracks) return;

    const prevTrack = tracks[currentTrack];
    prevTrack.pause();
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
      setPlayhead(seekTo);
    } else {
      switchToTrack(index);
    }
  };

  // Teardown
  useEffect(() => {
    return () => {
      tracks?.forEach((track) => {
        track.pause();
      });
      if (framerRef.current) clearInterval(framerRef.current);
    };
  }, [tracks]);

  useEffect(() => {
    // Teardown on route change
    return () => {
      tracks?.forEach((track) => {
        track.pause();
      });
      if (framerRef.current) clearInterval(framerRef.current);
    };
  }, [pathname, tracks]);

  const bounceHash = useMemo(() => versionData?.bounce, [versionData?.bounce]);
  const stems = useMemo(() => versionData?.stems || [], [versionData?.stems]);

  return (
    <div
      className={`version-player rounded-[7px] border border-white/20 bg-white/5 text-white ${isSoloed ? "solo" : ""}`}
      style={playerStyle}>
      {/* Bounce */}
      <div className="bounce py-[35px] px-[25px] border-b border-white/20 grid grid-cols-[auto_1fr] gap-5 items-center">
        <button
          onClick={onPlay}
          className="play-pause w-[55px] h-[55px] bg-white rounded-full text-[var(--dark-grey)] flex justify-center items-center">
          {loading ? <LoadingSpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        {bounceHash && (
          <TrackPreview
            svg={bounceHash}
            className={`bounce-track transition-opacity duration-300 ${currentTrack === 0 ? "active" : ""} ${currentTrack !== 0 ? "opacity-40" : ""}`}
            onSeek={(s) => onSeek(s, 0)}
          />
        )}
      </div>

      {/* Stems */}
      <div className="stems desktop-only my-[30px] hidden md:block">
        {stems.map((stem, i) => (
          <button
            key={i}
            onClick={() => switchToTrack(i + 1)}
            className={`stem grid grid-cols-[auto_1fr] gap-[50px] w-full px-[30px] transition-opacity duration-300 cursor-pointer ${currentTrack === i + 1 ? "active" : ""} ${isSoloed && currentTrack !== i + 1 ? "opacity-40" : ""}`}>
            <div className="solo grid grid-rows-[auto_1fr] pl-5 h-full">
              <div
                className={`circle w-[10px] h-[10px] border border-white rounded-full transition-colors duration-300 ${currentTrack === i + 1 ? "bg-white" : ""}`}
              />
              {i < stems.length - 1 && (
                <div className="line w-px h-full bg-white opacity-30 mx-auto" />
              )}
            </div>
            <div className="track text-left pb-[10px]" onClick={(e) => e.stopPropagation()}>
              <h6 className="font-mono text-[11px] m-0 uppercase">{stem.name || ""}</h6>
              {stem.id && <TrackPreview svg={stem.id} onSeek={(s) => onSeek(s, i + 1)} />}
            </div>
          </button>
        ))}
      </div>

      {/* Audio */}
      <audio ref={audioRef} />
    </div>
  );
}
