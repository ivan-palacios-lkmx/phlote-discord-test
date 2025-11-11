"use client";

import "@/app/(product)/sessions/sessions.scss";
import Paginate from "@/components/paginate/Paginate";
import SessionPreviewBlock from "@/components/session/SessionPreviewBlock/SessionPreviewBlock";
import SessionsResultsFilters from "@/components/session/SessionsResultsFilters/SessionsResultsFilters";
import SessionsResultsSorting from "@/components/session/SessionsResultsSorting/SessionsResultsSorting";
import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import { useGetAccount } from "@/hooks/query/query-hooks/useAccount";
import useSessions from "@/hooks/useSessions";
import { PrismicRichText } from "@prismicio/react";
import { usePrivy } from "@privy-io/react-auth";
import { flatten, uniq } from "lodash";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface SessionsPageClientProps {
  prismicPage?: {
    data?: {
      header_copy?: unknown;
    } | null;
  } | null;
}

export default function SessionsPageClient({ prismicPage }: SessionsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, authenticated } = usePrivy();

  // Get wallet address
  const walletAddress = useMemo(() => {
    if (!user || !authenticated) return "";
    const walletAccount = user.linkedAccounts?.find((acc) => acc.type === "wallet");
    return walletAccount && "address" in walletAccount ? (walletAccount.address as string) : "";
  }, [user, authenticated]);

  // Get account info to check if user is creator
  const { data: accountInfo } = useGetAccount({
    address: walletAddress,
    enabled: authenticated && !!walletAddress,
  });

  const isCreator = useMemo(() => {
    if (!authenticated || !accountInfo?.data) return false;
    const role = accountInfo.data.role;
    return role === "admin" || role === "creator";
  }, [authenticated, accountInfo]);

  // Page size
  const pageSize = useMemo(() => {
    const pageSizeParam = searchParams.get("pageSize");
    return pageSizeParam ? parseInt(pageSizeParam, 10) : 16;
  }, [searchParams]);

  // Get sessions
  const { sessions, totalResults, totalPages, loadingSessions } = useSessions({
    pageSize,
  });

  // Get unique collaborators from sessions
  const sessionCollaborators = useMemo(() => {
    return uniq(
      flatten(
        sessions.map((session) => {
          const collaborators = session.collaborators;
          return Array.isArray(collaborators) ? collaborators : [];
        }),
      ),
    );
  }, [sessions]);

  // Current page from URL
  const currentPage = useMemo(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 0;
  }, [searchParams]);

  // Handle page click
  const onPageClick = (page: number) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("page", page.toString());
    router.push(`${pathname}?${current.toString()}`);
  };

  return (
    <div className="sessions">
      {prismicPage?.data?.header_copy && (
        <div className="header-copy design-grid">
          <div className="entry">
            <PrismicRichText field={prismicPage.data.header_copy as never} />
          </div>
        </div>
      )}

      <div className="contained">
        {/* Results Header */}
        <div className="sessions-results-header">
          <SessionsResultsFilters resultCount={totalResults} />
          <SessionsResultsSorting sessionCollaborators={sessionCollaborators} />
        </div>

        {/* Loading */}
        {loadingSessions && (
          <div className="loading-sessions">
            <LoadingSpinnerIcon />
          </div>
        )}

        {/* Sessions Results */}
        {!loadingSessions && sessions.length > 0 && (
          <div className="sessions-results">
            {sessions.map((session) => (
              <SessionPreviewBlock
                key={session.objectID}
                name={(session.name as string) || ""}
                objectID={session.objectID}
                tags={(session.tags as string[]) || []}
                creator={(session.creator as string) || ""}
                collaborators={(session.collaborators as string[]) || []}
                versionCount={(session.versionCount as number) || 0}
                downloadCount={(session.downloadCount as number) || 0}
              />
            ))}
          </div>
        )}

        {/* No Sessions */}
        {!loadingSessions && sessions.length === 0 && (
          <h5 className="no-sessions">There are no sessions with these filters.</h5>
        )}

        {/* New Session Button */}
        {isCreator && (
          <Link href="/sessions/new" className="new-session inverse desktop-only">
            <span>Start New Session</span>
            <span>+</span>
          </Link>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Paginate pageCount={totalPages} clickHandler={onPageClick} currentPage={currentPage} />
        )}
      </div>
    </div>
  );
}
