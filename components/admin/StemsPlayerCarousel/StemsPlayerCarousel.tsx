"use client";

import StemsPlayerCarouselRow from "@/components/admin/StemsPlayerCarouselRow/StemsPlayerCarouselRow";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import { useClientCollection } from "@/hooks/sessions/useClientCollection";
import { useFbGlobals } from "@/hooks/useFbGlobals";
import useSessions from "@/hooks/useSessions";
import { db } from "@/lib/firebase";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "fecha";
import { collection, orderBy, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import "./StemsPlayerCarousel.scss";

interface SessionResult {
  objectID: string;
  name?: string;
  creator?: string;
  versionCount?: number;
  collaborators?: string[];
  [key: string]: unknown;
}

interface VersionDoc {
  id: string;
  sessionID?: string;
  creator?: string;
  versionIndex?: number;
  created?: { toDate: () => Date };
  stems?: string[];
  [key: string]: unknown;
}

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
  const { settingsDoc, updateSettings } = useFbGlobals();
  const [searchText, setSearchText] = useState("");
  const [selectedSession, setSelectedSession] = useState<SessionResult | null>(null);
  const [carouselItems, setCarouselItems] = useState<string[]>([]);

  const { sessions: searchResults, loadingSessions } = useSessions({
    pageSize: 10,
    search: searchText || null,
  });

  const dbCarouselItems = useMemo(() => {
    return (settingsDoc as { stemsCarousel?: string[] } | null)?.stemsCarousel || [];
  }, [settingsDoc]);

  useEffect(() => {
    if (JSON.stringify(carouselItems) !== JSON.stringify(dbCarouselItems)) {
      setCarouselItems([...dbCarouselItems]);
    }
  }, [dbCarouselItems, carouselItems]);

  useEffect(() => {
    if (JSON.stringify(carouselItems) !== JSON.stringify(dbCarouselItems) && settingsDoc) {
      updateSettings({
        stemsCarousel: carouselItems,
      });
    }
  }, [carouselItems, dbCarouselItems, settingsDoc, updateSettings]);

  const versionQ = useMemo(() => {
    if (!selectedSession) return null;

    return query(
      collection(db, "session-versions"),
      where("sessionID", "==", selectedSession.objectID),
      orderBy("created", "desc"),
    );
  }, [selectedSession]);

  const { data: availableVersions, pending: loadingVersions } = useClientCollection(versionQ);

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

    setCarouselItems((items) => {
      const oldIndex = items.findIndex((item) => item === active.id);
      const newIndex = items.findIndex((item) => item === over.id);

      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);

      return newItems;
    });
  };

  const onRemoveItem = (itemID: string) => {
    setCarouselItems((items) => items.filter((id) => id !== itemID));
  };

  const onAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("add session");
  };

  const onAddToCarousel = (versionID: string) => {
    setCarouselItems((items) => [...items, versionID]);
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

      {carouselItems.length > 0 && (
        <div className="carousel-list-area">
          <div className="carousel-label">Carousel Items:</div>

          <DndContext onDragEnd={handleCarouselDragEnd}>
            <SortableContext items={carouselItems} strategy={verticalListSortingStrategy}>
              {carouselItems.map((versionID) => (
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
                availableVersions.map((version) => {
                  const v = version as VersionDoc;
                  return (
                    <div key={v.id} className="result-preview version-preview">
                      {v.creator && (
                        <AvatarFromAddress address={v.creator} className="creator-avatar" />
                      )}
                      <div className="meta">
                        <div className="session-name">
                          {v.versionIndex !== undefined ? formatVersionIndex(v.versionIndex) : ""}
                        </div>
                        <div className="version-count">
                          <span>Created: </span>
                          <span>
                            {v.created ? formatDate(v.created as { toDate: () => Date }) : ""}
                          </span>
                        </div>
                        <div className="collab-count">
                          <span>Stems: </span>
                          <span>{Array.isArray(v.stems) ? v.stems.length : 0}</span>
                        </div>
                      </div>
                      <button className="btn" type="button" onClick={() => onAddToCarousel(v.id)}>
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
                  const session = result as SessionResult;
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
