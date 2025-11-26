"use client";

import "@/app/(product)/sessions/[sessionID]/sessionId.scss";
import SessionBreadcrumb from "@/components/session/SessionBreadcrumb/SessionBreadcrumb";
import SessionDetailActivity from "@/components/session/SessionDetailActivity/SessionDetailActivity";
import SessionDetailMeta from "@/components/session/SessionDetailMeta/SessionDetailMeta";
import SessionDetailNewVersion from "@/components/session/SessionDetailNewVersion/SessionDetailNewVersion";
import SessionDetailPlayer from "@/components/session/SessionDetailPlayer/SessionDetailPlayer";
import SessionDetailTitle from "@/components/session/SessionDetailTitle/SessionDetailTitle";
import SessionDetailVersions from "@/components/session/SessionDetailVersions/SessionDetailVersions";
import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useGetSession } from "@/hooks/query/query-hooks/use-get-session";
import { useGetVersions } from "@/hooks/query/query-hooks/use-get-versions";
import type { Session, Version } from "@/types/client";
import { SessionDocWithID } from "@/types/database";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

interface SessionDetailPageProps {
  params: Promise<{
    sessionID: string;
  }>;
}

export default function SessionDetailPage({}: SessionDetailPageProps) {
  const { sessionID } = useParams<{ sessionID: string }>();
  const { data: session, isPending } = useGetSession(sessionID);
  const router = useRouter();
  const searchParams = useSearchParams();
  const artworkRef = useRef<HTMLDivElement>(null);

  const { data: versions } = useGetVersions({
    sessionId: sessionID,
    enabled: !!sessionID,
  });

  const versionIdx = useMemo(() => {
    const v = searchParams.get("v");
    return v ? parseInt(v, 10) : 0;
  }, [searchParams]);

  const activeVersion = useMemo(() => {
    if (!versionIdx) {
      return versions?.length && versions.length > 0 ? versions[versions.length - 1] : null;
    }
    return versions?.find((v) => v.versionIndex === versionIdx) || null;
  }, [versionIdx, versions]);

  const versionDataLoading = useMemo(() => !activeVersion, [activeVersion]);
  const versionIsProcessing = useMemo(() => {
    return !!(activeVersion?.sessionID && !activeVersion?.versionIndex);
  }, [activeVersion]);

  const creator = useMemo(() => activeVersion?.creator, [activeVersion?.creator]);
  const { data: creatorInfo } = useGetAddressInfo(creator || "", !!creator);
  const creatorHasAvatar = useMemo(() => {
    return !!(creatorInfo?.zora?.profileImageURL || creatorInfo?.openSea?.profileImageURL);
  }, [creatorInfo]);

  useEffect(() => {
    if (!artworkRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (artworkRef.current) {
        void artworkRef.current.offsetHeight;
      }
    });

    resizeObserver.observe(artworkRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        router.push("/sessions");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [router]);

  if (!session && !isPending) {
    notFound();
  }

  if (!session) {
    return null;
  }

  const sessionWithId: SessionDocWithID = {
    ...session,
    id: sessionID,
  };

  return (
    <main>
      <div className="session-detail">
        <div className="bg-area">
          {creatorHasAvatar && creator ? (
            <Web3Avatar
              className="background fade-enter-active"
              avatar={
                creatorInfo?.zora?.profileImageURL ||
                creatorInfo?.openSea?.profileImageURL ||
                "/images/phlote-poster.jpg"
              }
              key={creator}
            />
          ) : (
            <div className="default-background fade-enter-active" key="default" />
          )}
        </div>

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
            <SessionBreadcrumb name={(sessionWithId?.name as string) || ""} />

            <div className="session-detail-layout">
              <div className="session-artwork" ref={artworkRef}>
                {creator && (
                  <Web3Avatar
                    className="session-artwork-image"
                    avatar={
                      creatorInfo?.zora?.profileImageURL ||
                      creatorInfo?.openSea?.profileImageURL ||
                      "/images/phlote-poster.jpg"
                    }
                    key={creator}
                  />
                )}
              </div>

              {activeVersion && <SessionDetailTitle session={session} version={activeVersion} />}

              <SessionDetailActivity
                sessionID={sessionWithId.id}
                versions={versions as unknown as Version[]}
              />

              <SessionDetailMeta
                session={sessionWithId as unknown as Session}
                version={activeVersion ? (activeVersion as unknown as Version) : undefined}
              />

              {activeVersion && (
                <SessionDetailNewVersion
                  sessionID={sessionWithId.id}
                  versionID={activeVersion.id}
                />
              )}

              {activeVersion && <SessionDetailPlayer version={activeVersion} key={versionIdx} />}

              {activeVersion && (
                <SessionDetailVersions versions={versions} activeVersionID={activeVersion.id} />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
