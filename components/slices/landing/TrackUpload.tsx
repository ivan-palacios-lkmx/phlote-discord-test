"use client";

import { quickHash } from "@/utils/functions";
import { useEffect, useState } from "react";

interface Track {
  id: string;
  name: string;
  file: File;
  error?: string;
  hash?: string;
}

interface TrackUploadProps {
  track: Track;
  onProcessed: (hash: string) => void;
  onError: (error: string) => void;
  children?: React.ReactNode;
}

export default function TrackUpload({ track, onProcessed, onError, children }: TrackUploadProps) {
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (track.hash || track.error || processing) return;

    const processTrack = async () => {
      setProcessing(true);
      try {
        // Generate hash from file name and timestamp
        const hashInput = `${track.name}-${track.file.size}-${track.file.lastModified}`;
        const hash = quickHash(hashInput);
        onProcessed(hash);
      } catch (error) {
        onError(error instanceof Error ? error.message : "Error processing track");
      } finally {
        setProcessing(false);
      }
    };

    processTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id]);

  return (
    <div className="flex-1 flex justify-center items-center">
      {children}
      {processing && <span className="ml-2 text-xs opacity-70">Processing...</span>}
    </div>
  );
}
