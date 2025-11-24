"use client";

import DraggableTrack from "@/components/DraggableTrack/DraggableTrack";
import { useMultiTrackUpload } from "@/hooks/use-multi-track-upload";
import { AudioProcessingStatus } from "@/types/api";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import React from "react";

import "./MultiTrackUpload.scss";

interface MultiTrackUploadProps {
  name: string;
}

export default function MultiTrackUpload({ name }: MultiTrackUploadProps) {
  const {
    tracks,
    tempFileNames,
    areaRef,
    audioStatusQueries,
    isSubmittingAudio,
    getRootProps,
    getInputProps,
    isDragActive,
    onRemoveTrack,
  } = useMultiTrackUpload({ name });

  return (
    <DndContext>
      <div
        className={`multi-track-upload ${isDragActive ? "hovered" : ""} ${
          tracks.length ? "has-files" : ""
        }`}
        ref={areaRef}
        {...getRootProps()}
        data-lenis-prevent>
        <input {...getInputProps()} />
        {!tracks.length ? (
          <div className="centered">
            <span>Drop Stems (.wav or .mp3)</span>
          </div>
        ) : (
          <SortableContext items={tracks.map((track) => track.name)}>
            {tracks.map((track, i) => {
              const statusIndex = tempFileNames.findIndex((name) => name === track.tempFileName);
              const queryStatus = audioStatusQueries[statusIndex]?.data?.status;
              const isLoading = audioStatusQueries[statusIndex]?.isLoading;

              const status: AudioProcessingStatus =
                queryStatus || (track.status as AudioProcessingStatus) || "pending";

              return (
                <DraggableTrack
                  key={track.name + i}
                  track={track}
                  onRemoveTrack={onRemoveTrack}
                  isUploading={isSubmittingAudio || isLoading}
                  status={status}
                />
              );
            })}
          </SortableContext>
        )}
      </div>
    </DndContext>
  );
}
