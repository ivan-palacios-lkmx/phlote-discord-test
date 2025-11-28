"use client";

import StemsPlayerCarouselRow from "@/components/admin/StemsPlayerCarouselRow/StemsPlayerCarouselRow";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useGetSettings } from "@/hooks/query/query-hooks/use-get-settings";
import { useGetStemsCarousel } from "@/hooks/query/query-hooks/use-get-stems-carousel";
import { useGetVersions } from "@/hooks/query/query-hooks/use-get-versions";
import useSessions from "@/hooks/useSessions";
import { AlgoliaSession } from "@/types/database";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "fecha";
import { useState } from "react";

import "./StemsPlayerCarousel.scss";

function AvatarFromAddress({ address, className }: { address: string; className?: string }) {
  const { data: addressInfo } = useGetAddressInfo(address, false, !!address);
  if (!addressInfo?.avatar) {
    return <div className={`web3-avatar ${className || ""}`} />;
  }

  return <Web3Avatar avatar={addressInfo.avatar} className={className} />;
}

function DraggableCarouselRow({
  versionID,
  onRemove,
}: {
  versionID: string;
  onRemove: (versionID: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: versionID,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}>
      <StemsPlayerCarouselRow versionID={versionID} onRemove={onRemove} />
    </div>
  );
}

export default function StemsPlayerCarousel() {
  const { data: stemsCarousel } = useGetStemsCarousel();
  const [searchText, setSearchText] = useState("");
  const [selectedSession, setSelectedSession] = useState<AlgoliaSession | null>(null);

  // this is working with Algolia, so we dont need to use a query from query client
  const { sessions: searchResults, loadingSessions } = useSessions({
    pageSize: 10,
    search: searchText || null,
  });

  const { data: availableVersions, isPending: loadingVersions } = useGetVersions(
    selectedSession?.objectID || "",
    !!selectedSession?.objectID,
  );

  const formatVersionIndex = (idx: number) => {
    return `V_${String(idx).padStart(3, "0")}`;
  };

  const formatDate = (date: { toDate: () => Date } | undefined) => {
    if (!date) return "";
    const d = date.toDate();
    if (!d) return "";
    return format(d, "MM/DD hh:mmA");
  };

  const handleCarouselDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }
  };

  const onRemoveItem = (itemID: string) => {};

  const onAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("add session");
  };

  const onAddToCarousel = (versionID: string) => {
    setSelectedSession(null);
  };

  return (
    <div className="admin-stems-player-carousel">
      <h6 className="area-label">Stems Player Carousel:</h6>

      <div className="entry">
        <p>
          Set which sessions/versions will appear when using the &quot;Stems Player&quot; slice in
          Prismic.
        </p>
      </div>

      {stemsCarousel && stemsCarousel.length > 0 && (
        <div className="carousel-list-area">
          <div className="carousel-label">Carousel Items:</div>

          <DndContext onDragEnd={handleCarouselDragEnd}>
            <SortableContext items={stemsCarousel} strategy={verticalListSortingStrategy}>
              {stemsCarousel.map((versionID) => (
                <DraggableCarouselRow
                  key={versionID}
                  versionID={versionID}
                  onRemove={onRemoveItem}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      <form onSubmit={onAddSession} className="sessions-add-form">
        {selectedSession ? (
          <>
            <h5 className="form-title">Select Version for &quot;{selectedSession.name}&quot;</h5>
            <div className="version-options">
              {loadingVersions ? (
                <div>Loading versions...</div>
              ) : (
                availableVersions?.map((version) => {
                  return (
                    <div key={version.id} className="result-preview version-preview">
                      {version.creator && (
                        <AvatarFromAddress address={version.creator} className="creator-avatar" />
                      )}
                      <div className="meta">
                        <div className="session-name">
                          {version.versionIndex !== undefined
                            ? formatVersionIndex(version.versionIndex)
                            : ""}
                        </div>
                        <div className="version-count">
                          <span>Created: </span>
                          <span>
                            {version.created
                              ? formatDate(version.created as unknown as { toDate: () => Date })
                              : ""}
                          </span>
                        </div>
                        <div className="collab-count">
                          <span>Stems: </span>
                          <span>{Array.isArray(version.stems) ? version.stems.length : 0}</span>
                        </div>
                      </div>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => onAddToCarousel(version.id)}>
                        Add to Carousel
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="session search"
              className="search-box"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {loadingSessions ? (
              <div className="search-results-preview">
                <p>Loading...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="search-results-preview">
                {searchResults.map((result) => {
                  const session = result as unknown as AlgoliaSession;
                  return (
                    <div key={session.objectID} className="result-preview">
                      {session.creator && (
                        <AvatarFromAddress address={session.creator} className="creator-avatar" />
                      )}
                      <div className="meta">
                        <div className="session-name">{session.name || ""}</div>
                        <div className="version-count">
                          <span>Versions: </span>
                          <span>{session.versionCount || 0}</span>
                        </div>
                        <div className="collab-count">
                          <span>Collaborators: </span>
                          <span>
                            {Array.isArray(session.collaborators)
                              ? session.collaborators.length
                              : 0}
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => setSelectedSession(session)}>
                        Select
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="search-results-preview">
                <p>No search results</p>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
}
