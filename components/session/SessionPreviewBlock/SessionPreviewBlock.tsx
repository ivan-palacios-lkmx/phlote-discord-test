"use client";

import AvatarStack from "@/components/AvatarStack/AvatarStack";
import { usePrismicio } from "@/components/PrismicioProvider";
import TrackPreview from "@/components/TrackPreview/TrackPreview";
import SvgIconCreator from "@/components/icons/Creator";
import SvgIconDownload from "@/components/icons/Download";
import LoadingSpinnerIcon from "@/components/icons/LoadingSpinner";
import PauseIcon from "@/components/icons/Pause";
import PlayIcon from "@/components/icons/Play";
import SvgIconStem from "@/components/icons/Stem";
import SvgIconVersion from "@/components/icons/Version";
import MatchIcon from "@/components/match-icon/MatchIcon";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useGetVersions } from "@/hooks/query/query-hooks/use-get-versions";
import useAudio from "@/hooks/useAudio";
import { startCase } from "lodash";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import smartTruncate from "smart-truncate";

import "./SessionPreviewBlock.scss";

interface SessionPreviewBlockProps {
  name: string;
  objectID: string;
  tags?: string[];
  creator: string;
  collaborators?: string[];
  versionCount?: number;
  downloadCount?: number;
}

export default function SessionPreviewBlock({
  name,
  objectID,
  tags = [],
  creator,
  collaborators = [],
  versionCount = 0,
  downloadCount = 0,
}: SessionPreviewBlockProps) {
  const { data: creatorInfo } = useGetAddressInfo(creator || "", false, !!creator);
  const { data: firstVersion } = useGetVersions({
    sessionId: objectID,
    enabled: !!objectID,
    index: 0,
  });
  const elRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  // TODO: Remove this once we have a real ready state
  const [ready, setReady] = useState(true);

  // Prismicio settings
  const { settings } = usePrismicio();

  // Session image
  const sessionImage = useMemo(
    () => creatorInfo?.avatar || settings?.default_user_image?.url || "",
    [creatorInfo?.avatar, settings?.default_user_image?.url],
  );

  const versionID = useMemo(() => firstVersion?.[0]?.id, [firstVersion?.[0]?.id]);
  const bounceHash = useMemo(
    () => firstVersion?.[0]?.bounce as string | undefined,
    [firstVersion?.[0]?.bounce],
  );
  const stemCount = useMemo(
    () => (firstVersion?.[0]?.stems as string[])?.length || 0,
    [firstVersion?.[0]?.stems],
  );

  // Audio hook
  const { loading, playing, progress, togglePlay, seek } = useAudio(versionID);

  // Fetch waveTrace SVG
  // Get element height
  useEffect(() => {
    if (!elRef.current) return;
    const updateHeight = () => {
      if (elRef.current) {
        setHeight(elRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Set ready when bounceHash is available
  useEffect(() => {
    if (bounceHash) {
      const timer = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [bounceHash]);

  // Trimmed name
  const trimmedName = useMemo(() => smartTruncate(name, 45, { position: 20 }), [name]);
  const hasLongName = useMemo(() => trimmedName.length > 30, [trimmedName]);

  // Tags processing
  const otherTags = useMemo(() => {
    const tagsArray = Array.isArray(firstVersion?.[0]?.tags) ? firstVersion[0].tags : [];
    const versionTags = tagsArray
      .filter((t: string) => !t.includes("needs:"))
      .map((t: string) => String(t).split(":")[1]);
    const bpm = firstVersion?.[0]?.bpm ? `${firstVersion[0].bpm}BPM` : "";
    return [bpm, ...versionTags].filter(Boolean);
  }, [firstVersion]);

  const needsTags = useMemo(() => {
    const tagsArray = Array.isArray(firstVersion?.[0]?.tags) ? firstVersion[0].tags : [];
    return tagsArray
      .filter((t: string) => t.includes("needs:"))
      .map((t: string) => {
        const parts = String(t).split(":");
        return startCase(parts[parts.length - 1] || "");
      });
  }, [firstVersion]);

  // Classes
  const classes = useMemo(() => {
    return [
      "session-preview-block",
      hasLongName ? "long-name" : "",
      playing ? "playing" : "",
      ready ? "ready" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [hasLongName, playing, ready]);

  // Styles
  const elStyle = useMemo(() => {
    return {
      "--progress": `${(1 - progress) * 100}%`,
    } as React.CSSProperties & { "--progress": string };
  }, [progress]);

  const imageAreaStyle = useMemo(() => {
    return {
      backgroundImage: `url(${sessionImage})`,
    };
  }, [sessionImage]);

  return (
    <div ref={elRef} className={classes} style={elStyle} onClick={togglePlay}>
      {/* Image */}
      <div className="image-area" style={{ width: height ? `${height}px` : "auto" }}>
        <div className="image" style={imageAreaStyle} />

        <button>{loading ? <LoadingSpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}</button>

        <div className="mobile-only">
          <AvatarStack addresses={collaborators} />
        </div>
      </div>

      {/* Metadata */}
      <div className="metadata-area">
        <div className="preview-title">
          <h3 className="session-name">{trimmedName}</h3>
        </div>

        <ul className="preview-tags ul-reset">
          {otherTags.map((tag, index) => (
            <li key={index}>{tag}</li>
          ))}
        </ul>

        <div className="preview-attributes">
          <div className="attribute-wrap">
            <span>
              <SvgIconDownload />
              <span>{downloadCount}</span>
              <span>Downloads</span>
            </span>
            <span>
              <SvgIconCreator />
              <span>{collaborators?.length || 0}</span>
              <span>Collaborators</span>
            </span>
            <span>
              <SvgIconStem />
              <span>{stemCount}</span>
              <span>Stems</span>
            </span>
            <span>
              <SvgIconVersion />
              <span>{versionCount}</span>
              <span>Versions</span>
            </span>

            <div className="collaborators desktop-only">
              <AvatarStack addresses={collaborators} />
            </div>
          </div>
        </div>

        {bounceHash && (
          <div onClick={(e) => e.stopPropagation()}>
            <TrackPreview
              hash={bounceHash}
              className={`preview-waveform ${playing ? "active" : ""}`}
              onSeek={seek}
            />
          </div>
        )}

        <ul className="preview-needs-tags ul-reset">
          {needsTags.map((tag: string, index: number) => (
            <li key={index}>
              <MatchIcon text={tag} />
            </li>
          ))}
        </ul>
      </div>

      {/* Join */}
      <div className="join-area desktop-only" onClick={(e) => e.stopPropagation()}>
        <Link href={`/sessions/${objectID}`} className="join inverse">
          Join Session
        </Link>
      </div>
    </div>
  );
}
