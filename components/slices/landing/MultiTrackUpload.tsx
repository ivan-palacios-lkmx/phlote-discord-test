"use client";

import type { ReactNode } from "react";

interface Track {
  id: string;
  name: string;
  file: File;
  error?: string;
}

interface MultiTrackUploadProps {
  value: Track[];
  onChange: (tracks: Track[]) => void;
  children: ReactNode;
}

export default function MultiTrackUpload({
  value,
  onChange,
  children,
}: MultiTrackUploadProps) {
  // TODO: Implementar funcionalidad de upload de múltiples tracks
  return (
    <div className="mt-[15px]">
      <div className="border border-black/20 rounded-[10px] bg-white p-5 text-center">
        {children}
      </div>
      {/* Placeholder - pendiente de implementación */}
    </div>
  );
}
