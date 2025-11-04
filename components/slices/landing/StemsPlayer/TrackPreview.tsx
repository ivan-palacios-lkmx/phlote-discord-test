"use client";

interface TrackPreviewProps {
  svg?: string;
  className?: string;
  onSeek?: (percentage: number) => void;
}

export default function TrackPreview({ svg, className = "", onSeek }: TrackPreviewProps) {
  return (
    <div
      className={`track-preview h-5 relative block w-full ${className}`}
      style={{ "--progress": "100%" } as React.CSSProperties}
      onClick={(e) => {
        if (onSeek) {
          const rect = e.currentTarget.getBoundingClientRect();
          const percentage = (e.clientX - rect.left) / rect.width;
          onSeek(percentage);
        }
      }}>
      {svg && (
        <div
          className="outline absolute inset-0 w-full h-full pointer-events-none [&_svg]:w-full [&_svg]:h-full [&_svg]:absolute [&_svg]:bottom-0 [&_svg]:right-0 [&_svg]:left-0 [&_svg]:top-0 [&_svg_.blobs]:stroke-[7px] [&_svg_.blobs]:stroke-current [&_svg_.blobs]:fill-none"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
}
