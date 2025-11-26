"use client";

import SessionDetailVersionsRow from "@/components/session/SessionDetailVersionsRow/SessionDetailVersionsRow";
import { VersionDocWithID } from "@/types/database";
import { last, reverse, uniq } from "lodash";
import { useMemo } from "react";

import "./SessionDetailVersions.scss";

interface SessionDetailVersionsProps {
  versions?: VersionDocWithID[];
  activeVersionID?: string;
}

export default function SessionDetailVersions({
  versions = [],
  activeVersionID,
}: SessionDetailVersionsProps) {
  // Find active version index
  const activeVersionIndex = useMemo(() => {
    const activeVersion = versions.find((v) => v.id === activeVersionID);
    return activeVersion?.versionIndex ?? 0;
  }, [versions, activeVersionID]);

  // Reverse versions array
  const flippedVersions = useMemo(() => {
    return reverse([...versions]);
  }, [versions]);

  // Calculate lineage from genesis to active version
  const lineage = useMemo(() => {
    if (versions.length === 0 || !activeVersionID) return [];

    const genesisVersionID = last(versions)?.id;
    if (!genesisVersionID) return [];

    let out: string[] = [genesisVersionID];
    let pointerID: string | undefined = activeVersionID;
    let iterations = 0;

    while (pointerID !== genesisVersionID && iterations <= versions.length) {
      const thisVersion = versions.find((v) => v.id === pointerID);
      if (!thisVersion) break;

      out = [thisVersion.id, ...out];
      pointerID = (thisVersion.sourceVersion as string | undefined) || genesisVersionID;
      iterations++;
    }

    return uniq(out);
  }, [versions, activeVersionID]);

  return (
    <div className="session-detail-versions">
      {flippedVersions.map((version) => (
        <SessionDetailVersionsRow
          key={version.id}
          {...version}
          creator={version.creator}
          active={activeVersionID === version.id}
          included={lineage.includes(version.id)}
          withinRange={(version.versionIndex ?? 0) <= activeVersionIndex}
        />
      ))}
    </div>
  );
}
