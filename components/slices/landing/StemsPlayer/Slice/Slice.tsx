"use client";

import SessionDetailTitle from "@/components/slices/landing/StemsPlayer/SessionDetailTitle";
import VersionPlayer from "@/components/slices/landing/StemsPlayer/VersionPlayer";
import Web3Avatar from "@/components/slices/landing/StemsPlayer/Web3Avatar/Web3Avatar";
import { useClientDoc } from "@/hooks/useClientDoc";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { useMemo, useState } from "react";

import "./Slice.scss";

interface SliceProps {
  versionID: string;
}

export default function Slice({ versionID }: SliceProps) {
  const [isPointerDown, setIsPointerDown] = useState(false);

  // Firebase document references
  const versionDocRef = useMemo(() => doc(db, `session-versions/${versionID}`), [versionID]);
  const versionDoc = useClientDoc(versionDocRef);

  const creator = versionDoc?.creator as string | undefined;

  const sessionDocRef = useMemo(
    () => (versionDoc?.sessionID ? doc(db, `sessions/${versionDoc.sessionID}`) : null),
    [versionDoc?.sessionID],
  );
  const sessionDoc = useClientDoc(sessionDocRef);

  return (
    <div
      className={`slice-stems-player-slide ${isPointerDown ? "is-pointer-down" : ""}`}
      data-lenis-prevent
      onMouseDown={() => setIsPointerDown(true)}
      onMouseUp={() => setIsPointerDown(false)}
      onMouseLeave={() => setIsPointerDown(false)}>
      <div className="padder">
        {creator && <Web3Avatar address={creator} className="background-image" />}

        <div className="session-info">
          {creator && <Web3Avatar address={creator} className="artwork desktop-only" />}

          <SessionDetailTitle session={sessionDoc} version={versionDoc} />
        </div>

        {versionDoc && <VersionPlayer versionData={versionDoc} />}
      </div>
    </div>
  );
}
