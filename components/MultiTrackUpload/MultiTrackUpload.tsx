"use client";

import DraggableTrack from "@/components/DraggableTrack/DraggableTrack";
import { useSubmitAudio } from "@/hooks/query/mutations/use-submit-audio";
import { useCheckMultipleAudioStatus } from "@/hooks/query/query-hooks/use-check-multiple-audio-status";
import { AudioProcessingStatus, AudioProcessingStatusResponse } from "@/types/api";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useFormContext } from "react-hook-form";

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

  const { mutateAsync: submitAudio, isPending: isSubmittingAudio } = useSubmitAudio();

  const [tracks, setTracks] = useState<Track[]>([]);

  const [tempFileNames, setTempFileNames] = useState<string[]>([]);
  const areaRef = useRef<HTMLDivElement>(null);

  const audioStatusQueries = useCheckMultipleAudioStatus({
    temporaryAudioFileNames: tempFileNames,
  });

  useEffect(() => {
    if (audioStatusQueries.length > 0) {
      const statusResponses = audioStatusQueries
        .map((query) => query.data)
        .filter((data): data is AudioProcessingStatusResponse => data !== undefined);

      if (statusResponses.length > 0) {
        setValue(name, statusResponses);
      }
    }
  }, [audioStatusQueries, setValue, name]);

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

  // TODO: See how to sync field.value with tracks.
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <>
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
