"use client";

import "@/app/(product)/sessions/[sessionID]/sessionId.scss";
import OnlyMembers from "@/components/OnlyMembers/OnlyMembers";
import SessionBreadcrumb from "@/components/session/SessionBreadcrumb/SessionBreadcrumb";
import SessionDetailActivity from "@/components/session/SessionDetailActivity/SessionDetailActivity";
import SessionDetailMeta from "@/components/session/SessionDetailMeta/SessionDetailMeta";
import SessionDetailNewVersion from "@/components/session/SessionDetailNewVersion/SessionDetailNewVersion";
import SessionDetailPlayer from "@/components/session/SessionDetailPlayer/SessionDetailPlayer";
import SessionDetailTitle from "@/components/session/SessionDetailTitle/SessionDetailTitle";
import SessionDetailVersions from "@/components/session/SessionDetailVersions/SessionDetailVersions";
import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useAllVersions } from "@/hooks/sessions/useAllVersions";
import { useSession } from "@/hooks/sessions/useSession";
import { useWeb3Identity } from "@/hooks/useWeb3Identity";
import type { Version } from "@/types/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface SessionDetailClientProps {
  sessionID: string;
  initialSessionName?: string;
  initialOgImage?: string;
}

export default function SessionDetailClient({
  sessionID,
  initialSessionName,
  initialOgImage,
}: SessionDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const artworkRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // Get version index from query
  const versionIdx = useMemo(() => {
    const v = searchParams.get("v");
    return v ? parseInt(v, 10) : 0;
  }, [searchParams]);

  // Get session and versions
  const session = useSession(sessionID);
  const versions = useAllVersions(sessionID);

  // Find active version
  const activeVersion = useMemo(() => {
    if (!versionIdx) {
      return versions.length > 0 ? versions[versions.length - 1] : null;
    }
    return versions.find((v) => v.versionIndex === versionIdx) || null;
  }, [versionIdx, versions]);

  // Loading states
  const versionDataLoading = useMemo(() => !activeVersion, [activeVersion]);
  const versionIsProcessing = useMemo(() => {
    return !!(activeVersion?.sessionID && !activeVersion?.versionIndex);
  }, [activeVersion]);

  // Creator info
  const creator = useMemo(() => activeVersion?.creator, [activeVersion?.creator]);
  const { addressDoc } = useWeb3Identity(creator);
  const creatorHasAvatar = useMemo(() => {
    return !!(addressDoc?.zora?.profileImageURL || addressDoc?.openSea?.profileImageURL);
  }, [addressDoc]);

  // Get artwork height
  useEffect(() => {
    if (!artworkRef.current) return;

    const updateHeight = () => {
      if (artworkRef.current) {
        setHeight(artworkRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    // Use ResizeObserver for more accurate updates
    const resizeObserver = new ResizeObserver(updateHeight);
    if (artworkRef.current) {
      resizeObserver.observe(artworkRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      resizeObserver.disconnect();
    };
  }, []);

  // Redirect on mobile (assuming breakpoint 's' is mobile)
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        // Assuming mobile breakpoint
        router.push("/sessions");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [router]);

  // Artwork style
  const artworkStyle = useMemo(() => {
    return height ? { width: `${height}px` } : {};
  }, [height]);

  return (
    <OnlyMembers>
      <div className="session-detail">
        {/* Background Area */}
        <div className="bg-area">
          {creatorHasAvatar && creator ? (
            <Web3Avatar className="background fade-enter-active" address={creator} key={creator} />
          ) : (
            <div className="default-background fade-enter-active" key="default" />
          )}
        </div>

        {/* Content */}
        {versionIsProcessing ? (
          <div className="contained processing-versions" key="a">
            <div className="centered">
              <h6 className="label">Processing</h6>
              <LoadingSpinnerIcon />
            </div>
          </div>
        ) : versionDataLoading ? (
          <div className="contained loading-versions" key="b">
            <div className="centered">
              <LoadingSpinnerIcon />
            </div>
          </div>
        ) : (
          <div className="contained" key="c">
            {/* Breadcrumb */}
            <SessionBreadcrumb name={(session?.name as string) || ""} />

            <div className="session-detail-layout">
              {/* Artwork */}
              <div className="session-artwork" ref={artworkRef}>
                {creator && (
                  <Web3Avatar
                    className="session-artwork-image"
                    address={creator}
                    style={artworkStyle}
                    key={creator}
                  />
                )}
              </div>

              {/* Title Area */}
              <SessionDetailTitle session={session} version={activeVersion as Version | null} />

              {/* Activity */}
              <SessionDetailActivity sessionID={sessionID} versions={versions} />

              {/* Metadata */}
              <SessionDetailMeta session={session} version={activeVersion as Version | null} />

              {/* New Version */}
              {activeVersion && (
                <SessionDetailNewVersion sessionID={sessionID} versionID={activeVersion.id} />
              )}

              {/* Stem Player */}
              {activeVersion && (
                <SessionDetailPlayer version={activeVersion as Version} key={versionIdx} />
              )}

              {/* Version List */}
              {activeVersion && (
                <SessionDetailVersions versions={versions} activeVersionID={activeVersion.id} />
              )}
            </div>
          </div>
        )}
      </div>
    </OnlyMembers>
  );
}
