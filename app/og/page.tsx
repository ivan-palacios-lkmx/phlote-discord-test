"use client";

import AvatarStack from "@/components/AvatarStack/AvatarStack";
import TrackPreview from "@/components/TrackPreview/TrackPreview";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

import "./page.scss";

export const dynamic = "force-dynamic";

function OgPageContent() {
  const searchParams = useSearchParams();

  const bgImage = searchParams.get("bgImage") || "/images/default-bg.png";
  const artistName = searchParams.get("artist") || "";
  const songName = searchParams.get("song") || "";
  const hash = searchParams.get("hash") || "";

  // Handle avatars parameter which can be single or multiple
  // Assuming these are now addresses as expected by the AvatarStack component
  const avatars = searchParams.getAll("avatars");

  const [bgLoaded, setBgLoaded] = useState(false);

  // Wait for resources and set window.fullyRendered
  useEffect(() => {
    // Since we are using existing components with internal data fetching (React Query),
    // we can't easily know when they are "done".
    // We will rely on a slightly longer timeout + background image load.
    if (bgLoaded) {
      const timer1 = setTimeout(() => {
        const timer2 = setTimeout(() => {
          if (typeof window !== "undefined") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).fullyRendered = Promise.resolve(true);
          }
        }, 500); // Increased timeout to allow for internal component fetches
        return () => clearTimeout(timer2);
      }, 150);
      return () => clearTimeout(timer1);
    }
  }, [bgLoaded]);

  return (
    <div className="og-render-container" style={{ backgroundImage: `url(${bgImage})` }}>
      {/* Hidden image to detect background load */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgImage}
        alt=""
        style={{ display: "none" }}
        onLoad={() => setBgLoaded(true)}
        onError={() => setBgLoaded(true)}
      />

      <div className="overlay" />

      <div className="logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/Phlotelogo.png" alt="Phlote" className="phlote-logo" />
      </div>

      <div className="bottom-lock">
        {avatars.length > 0 && (
          <div className="avatar-area">
            <AvatarStack addresses={avatars} />
            <div className="creator-count">{avatars.length} Collaborators</div>
          </div>
        )}

        {artistName && <h1 className="artist-name">{artistName}</h1>}
        {songName && <h1 className="track-name">“{songName}”</h1>}

        {hash && (
          <div className="track-preview-wrapper">
            <TrackPreview hash={hash} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function OgPage() {
  return (
    <Suspense fallback={null}>
      <OgPageContent />
    </Suspense>
  );
}
