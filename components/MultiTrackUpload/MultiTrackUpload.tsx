"use client";

import DraggableTrack from "@/components/DraggableTrack/DraggableTrack";
import { useSubmitAudio } from "@/hooks/query/mutations/use-submit-audio";
import { useCheckMultipleAudioStatus } from "@/hooks/query/query-hooks/use-check-multiple-audio-status";
import { AudioProcessingStatus } from "@/types/api";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

import "./MultiTrackUpload.scss";

export interface Track {
  name: string;
  file: File;
  tempFileName?: string;
  path?: string;
  hash?: string;
  error?: string;
  status?: string;
}

export default function MultiTrackUpload() {
  const { mutateAsync: submitAudio, isPending: isSubmittingAudio } = useSubmitAudio();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [tempFileNames, setTempFileNames] = useState<string[]>([]);
  const areaRef = useRef<HTMLDivElement>(null);

  const audioStatusQueries = useCheckMultipleAudioStatus({
    temporaryAudioFileNames: tempFileNames,
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  async function onDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;
    const newTracks = acceptedFiles.map((file) => ({
      name: file.name,
      file,
    }));

    setTracks((prevTracks) => [...prevTracks, ...newTracks]);

    const newTempFileNames: string[] = [];
    for (const file of acceptedFiles) {
      try {
        const { tmpName } = await submitAudio({ audioFile: file });
        newTempFileNames.push(tmpName);

        setTracks((prevTracks) =>
          prevTracks.map((track) =>
            track.file === file ? { ...track, tempFileName: tmpName } : track,
          ),
        );
      } catch {
        setTracks((prevTracks) =>
          prevTracks.map((track) =>
            track.file === file ? { ...track, error: "Failed to upload" } : track,
          ),
        );
      }
    }

    setTempFileNames((prev) => [...prev, ...newTempFileNames]);
  }
  const onRemoveTrack = (name: string) => {
    setTracks((prevTracks) => {
      const trackToRemove = prevTracks.find((track) => track.name === name);
      if (trackToRemove?.tempFileName) {
        setTempFileNames((prev) =>
          prev.filter((fileName) => fileName !== trackToRemove.tempFileName),
        );
      }
      return prevTracks.filter((track) => track.name !== name);
    });
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
