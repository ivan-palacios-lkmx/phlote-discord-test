"use client";

import CloseIcon from "@/components/icons/Close";
import DragIcon from "@/components/icons/Drag";
import { useClientDoc } from "@/hooks/useClientDoc";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { useMemo } from "react";

import "./StemsPlayerCarouselRow.scss";

interface StemsPlayerCarouselRowProps {
  versionID: string;
  onRemove: (versionID: string) => void;
}

interface VersionDoc {
  id: string;
  sessionID?: string;
  versionIndex?: number;
  [key: string]: unknown;
}

interface SessionDoc {
  id: string;
  name?: string;
  [key: string]: unknown;
}

export default function StemsPlayerCarouselRow({
  versionID,
  onRemove,
}: StemsPlayerCarouselRowProps) {
  const formatVersionIndex = (idx: number | undefined) => {
    if (idx === undefined) return "";
    return `V_${String(idx).padStart(3, "0")}`;
  };

  const versionDocRef = useMemo(() => doc(db, `session-versions/${versionID}`), [versionID]);
  const versionDoc = useClientDoc(versionDocRef) as VersionDoc | null;

  const sessionID = useMemo(() => versionDoc?.sessionID, [versionDoc?.sessionID]);

  const sessionDocRef = useMemo(() => {
    if (!sessionID) return null;
    return doc(db, `sessions/${sessionID}`);
  }, [sessionID]);

  const sessionDoc = useClientDoc(sessionDocRef) as SessionDoc | null;

  return (
    <div className="admin-stems-player-carousel-row">
      <button type="button" className="drag-handle">
        <DragIcon />
      </button>
      <h5 className="stems-version-title">{sessionDoc?.name}</h5>
      <div className="version-number">{formatVersionIndex(versionDoc?.versionIndex)}</div>
      <button type="button" className="close" onClick={() => onRemove(versionID)}>
        <CloseIcon />
      </button>
    </div>
  );
}
