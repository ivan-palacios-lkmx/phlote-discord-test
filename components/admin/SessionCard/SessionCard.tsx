"use client";

import SessionsCardRow from "@/components/admin/SessionsCardRow/SessionsCardRow";
import { useDeleteVersion } from "@/hooks/query/mutations/use-delete-version";
import { useUpdateStemsCarousel } from "@/hooks/query/mutations/use-update-stems-carousel";
import { useGetStemsCarousel } from "@/hooks/query/query-hooks/use-get-stems-carousel";
import { useGetVersions } from "@/hooks/query/query-hooks/use-get-versions";
import { SessionDocWithID, VersionDocWithID } from "@/types/database";
import { useQueryClient } from "@tanstack/react-query";

import "./SessionCard.scss";

interface SessionCardProps {
  session: SessionDocWithID | null | undefined;
  onDeleteSession: (sessionId: string) => void;
}

export default function SessionCard({ session, onDeleteSession }: SessionCardProps) {
  const queryClient = useQueryClient();
  const {
    data: versions,
    isPending: isPendingVersions,
    isError: isErrorVersions,
  } = useGetVersions({ sessionId: session?.id || "" });
  const { mutate: deleteVersion } = useDeleteVersion();
  const { data: stemsCarousel } = useGetStemsCarousel();
  const { mutate: updateStemsCarousel } = useUpdateStemsCarousel();

  const handleDeleteVersion = (versionId: string) => {
    const wasLastVersion = versions?.length === 1;

    deleteVersion(
      { versionId },
      {
        onSuccess: () => {
          if (session?.id) {
            queryClient.setQueriesData<VersionDocWithID[]>(
              { queryKey: ["versions", session.id] },
              (oldData) => {
                if (!oldData) return oldData;
                return oldData.filter((v) => v.id !== versionId);
              },
            );

            if (wasLastVersion) {
              onDeleteSession(session.id);
            }
          }
          queryClient.invalidateQueries({ queryKey: ["version", versionId] });

          if (stemsCarousel?.includes(versionId)) {
            const updatedCarousel = stemsCarousel.filter((id) => id !== versionId);
            updateStemsCarousel(
              { stemsCarousel: updatedCarousel },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["stems-carousel"] });
                },
              },
            );
          }
        },
      },
    );
  };

  return (
    <div className="session-card">
      <div className="card-header">
        <h6 className="card-header-title">{session?.name || ""}</h6>
        <button
          onClick={() => onDeleteSession(session?.id || "")}
          className="btn delete-session"
          type="button">
          Delete Session
        </button>
      </div>
      <div className="card-version-list">
        {isPendingVersions ? (
          <div className="loading">Loading...</div>
        ) : isErrorVersions ? (
          <div className="error">Error loading versions</div>
        ) : (
          versions.map((version) => (
            <SessionsCardRow
              key={version.id}
              version={version}
              onDeleteVersion={() => handleDeleteVersion(version.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
