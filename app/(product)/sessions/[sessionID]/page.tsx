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

  const versionFromSearchParams = searchParams.get("v");
  const { data: versions } = useGetVersions({
    sessionId: sessionID,
    enabled: !!sessionID,
  });

  const versionIndex = versionFromSearchParams ? parseInt(versionFromSearchParams, 10) : 0;

  const activeVersion = useMemo(() => {
    if (!versionIndex) {
      return versions?.length && versions.length > 0 ? versions[versions.length - 1] : null;
    }
    return versions?.find((v) => v.versionIndex === versionIndex) || null;
  }, [versionIndex, versions]);

  const { data: creatorInfo } = useGetAddressInfo(
    activeVersion?.creator || "",
    !!activeVersion?.creator,
  );

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

  return (
    <main>
      <div className="session-detail">
        <div className="bg-area">
          <Web3Avatar
            className="background fade-enter-active"
            avatar={creatorInfo?.avatar || ""}
            key={activeVersion?.creator || ""}
          />
        </div>

        {isPending ? (
          <div className="contained loading-versions" key="b">
            <div className="centered">
              <LoadingSpinnerIcon />
            </div>
          </div>
        ) : (
          <div className="contained" key="c">
            <SessionBreadcrumb name={session?.name || ""} />

            <div className="session-detail-layout">
              <div className="session-artwork" ref={artworkRef}>
                {activeVersion?.creator && (
                  <Web3Avatar
                    className="session-artwork-image"
                    avatar={creatorInfo?.avatar || ""}
                    key={activeVersion?.creator || ""}
                  />
                )}
              </div>

              {activeVersion && <SessionDetailTitle session={session} version={activeVersion} />}

              <SessionDetailActivity sessionID={session.id} versions={versions} />

              <SessionDetailMeta session={session} version={activeVersion || undefined} />

              {activeVersion && (
                <SessionDetailNewVersion sessionID={session.id} versionID={activeVersion.id} />
              )}

              {activeVersion && <SessionDetailPlayer version={activeVersion} key={versionIndex} />}

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
