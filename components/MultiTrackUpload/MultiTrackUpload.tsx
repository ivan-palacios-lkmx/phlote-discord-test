"use client";

import DraggableTrack from "@/components/DraggableTrack/DraggableTrack";
import { useSubmitAudio } from "@/hooks/query/mutations/use-submit-audio";
import { useCheckMultipleAudioStatus } from "@/hooks/query/query-hooks/use-check-multiple-audio-status";
import { AudioProcessingStatus } from "@/types/api";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import "./MultiTrackUpload.scss";

interface MultiTrackUploadProps {
  name: string;
}

export interface Track {
  name: string;
  file: File;
  tempFileName?: string;
  path?: string;
  hash?: string;
  error?: string;
  status?: string;
}

export default function MultiTrackUpload({ name }: MultiTrackUploadProps) {
  if (!name) {
    throw new Error("MultiTrackUpload requires a 'name' prop");
  }

  const { control, setValue } = useFormContext();
  if (!setValue) {
    throw new Error("MultiTrackUpload must be used within a FormProvider");
  }

  const fieldValue = useWatch({ control, name });

  useEffect(() => {
    console.log(`[MultiTrackUpload] Field "${name}" value:`, fieldValue);
  }, [fieldValue, name]);

  const { mutateAsync: submitAudio, isPending: isSubmittingAudio } = useSubmitAudio();

  const [tracks, setTracks] = useState<Track[]>([]);

  const [tempFileNames, setTempFileNames] = useState<string[]>([]);
  const areaRef = useRef<HTMLDivElement>(null);

  const audioStatusQueries = useCheckMultipleAudioStatus({
    temporaryAudioFileNames: tempFileNames,
  });

  const tempFileNameToTrackNameRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    tracks.forEach((track) => {
      if (track.tempFileName) {
        tempFileNameToTrackNameRef.current.set(track.tempFileName, track.name);
      }
    });
  }, [tracks]);

  const prevStemsRef = useRef<string>("");

  useEffect(() => {
    if (audioStatusQueries.length > 0 && tempFileNames.length > 0) {
      const stems = tempFileNames
        .map((tempFileName, index) => {
          const statusResponse = audioStatusQueries[index]?.data;
          const trackName = tempFileNameToTrackNameRef.current.get(tempFileName);

          if (
            statusResponse &&
            statusResponse.status === "ready" &&
            statusResponse.hash &&
            trackName
          ) {
            return {
              name: trackName,
              hash: statusResponse.hash,
            };
          }
          return null;
        })
        .filter((stem): stem is { name: string; hash: string } => stem !== null);

      if (stems.length > 0) {
        const stemsKey = JSON.stringify(stems);
        if (prevStemsRef.current !== stemsKey) {
          prevStemsRef.current = stemsKey;
          setValue(name, stems);
        }
      }
    }
  }, [audioStatusQueries, tempFileNames, setValue, name]);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setTracks((items) => {
      const oldIndex = items.findIndex((track) => track.name === active.id);
      const newIndex = items.findIndex((track) => track.name === over.id);

      const newTracks = [...items];
      const [removed] = newTracks.splice(oldIndex, 1);
      newTracks.splice(newIndex, 0, removed);

      return newTracks;
    });
  }

  // TODO: See how to sync field.value with tracks.
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <>
          <DndContext onDragEnd={handleDragEnd}>
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
                    const statusIndex = tempFileNames.findIndex(
                      (name) => name === track.tempFileName,
                    );
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
          {fieldState.error && <p className="input-error">{fieldState.error.message}</p>}
        </>
      )}
    />
  );
}
