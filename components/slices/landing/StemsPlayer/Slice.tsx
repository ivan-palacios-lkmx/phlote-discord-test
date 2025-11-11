"use client";

import { useClientDoc } from "@/hooks/useClientDoc";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { useMemo, useState } from "react";

import VersionPlayer from "../../../VersionPlayer/VersionPlayer";
import SessionDetailTitle from "../../../session/SessionDetailTitle/SessionDetailTitle";
import Web3Avatar from "./Web3Avatar";

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
      className={`slice-stems-player-slide bg-black shadow-[0px_14px_50px_0px_rgba(0,0,0,0.8)] border border-black/35 rounded-[20px] relative overflow-hidden overflow-y-auto text-white ${
        isPointerDown ? "cursor-grabbing" : "cursor-grab"
      } [data-lenis-prevent]`}
      onMouseDown={() => setIsPointerDown(true)}
      onMouseUp={() => setIsPointerDown(false)}
      onMouseLeave={() => setIsPointerDown(false)}>
      <div className="padder relative p-[var(--margin)]">
        {creator && (
          <Web3Avatar
            address={creator}
            className="background-image scale-[1.2] blur-[20px] absolute object-cover opacity-50 h-full w-full -z-10"
          />
        )}

        <div className="session-info grid grid-cols-[190px_1fr] items-start mb-5 gap-5 md:block">
          {creator && (
            <Web3Avatar
              address={creator}
              className="artwork desktop-only relative after:content-[''] after:pb-[100%] after:block hidden md:block"
            />
          )}

          <SessionDetailTitle session={sessionDoc} version={versionDoc} />
        </div>

        {versionDoc && <VersionPlayer versionData={versionDoc} />}
      </div>
    </div>
  );
}
