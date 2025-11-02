"use client";
interface HeroTrackPreviewProps {
  hash?: string | null;
}
export default function HeroTrackPreview({ hash }: HeroTrackPreviewProps) {
  if (!hash) return null;

  return <></>;
}
