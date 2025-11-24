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
    setTracks((prevTracks) => [
      ...prevTracks,
      ...acceptedFiles.map((file) => ({ name: file.name, file })),
    ]);
  }
  const onRemoveTrack = (name: string) => {
    const newTracks = [...tracks];
    newTracks.splice(
      newTracks.findIndex((track) => track.name === name),
      1,
    );
    setTracks(newTracks);
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
          <SortableContext items={tracks.map((track) => track.name)}>
            {tracks.map((track, i) => {
              return (
                <DraggableTrack
                  key={track.name + i}
                  track={track}
                  onRemoveTrack={onRemoveTrack}
                  isUploading={false}
                  status="ready"
                />
              );
            })}
          </SortableContext>
        )}
      </div>
    </DndContext>
  );
}
