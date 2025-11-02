"use client";

interface HeroTrackPreviewProps {
  hash?: string | null;
  waveTrace?: string | null;
}

export default function HeroTrackPreview({ waveTrace }: HeroTrackPreviewProps) {
  if (!waveTrace) return null;

  return (
    <>
      <div className="fill" dangerouslySetInnerHTML={{ __html: waveTrace }} />
      <div className="outline" dangerouslySetInnerHTML={{ __html: waveTrace }} />
    </>
  );
}
