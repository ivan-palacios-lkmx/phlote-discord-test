"use client";

import DraggableTrack from "@/components/DraggableTrack/DraggableTrack";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

import "./MultiTrackUpload.scss";

export interface Track {
  name: string;
  file: File;
  path?: string;
  hash?: string;
  error?: string;
}

export default function MultiTrackUpload() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const areaRef = useRef<HTMLDivElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  function onDrop(acceptedFiles: File[]) {
    setTracks((prevTracks) => [...prevTracks, ...acceptedFiles]);
  }
  const onRemoveTrack = (index: number) => {
    const newTracks = [...tracks];
    newTracks.splice(index, 1);
    setTracks(newTracks);
  };

  const hasError = (index: number) => {
    return !!tracks[index]?.error;
  };

  const getError = (index: number) => {
    const error = tracks[index]?.error;
    return error ? { title: "Error", message: error } : null;
  };

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
          // Placeholder for draggable list (e.g., dnd-kit or react-beautiful-dnd)
          <SortableContext items={tracks.map((track) => track.name)}>
            {tracks.map((track, i) => {
              const error = getError(i);
              return (
                <DraggableTrack
                  key={track.name + i}
                  track={track}
                  error={error}
                  i={i}
                  hasError={hasError}
                  onRemoveTrack={onRemoveTrack}
                  isUploading={false}
                  isProcessing={false}
                />
              );
            })}
          </SortableContext>
        )}
      </div>
    </DndContext>
  );
}
