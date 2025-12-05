"use client";

import DraggableTrack from "@/components/DraggableTrack/DraggableTrack";
import { useSubmitAudio } from "@/hooks/query/mutations/use-submit-audio";
import { useCheckMultipleAudioStatus } from "@/hooks/query/query-hooks/use-check-multiple-audio-status";
import { useAudioValidationReady } from "@/hooks/use-audio-validation-ready";
import { AudioProcessingStatus } from "@/types/api";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useFormContext, useWatch } from "react-hook-form";

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

  // Detectar automáticamente qué estructura usar basado en el nombre del campo
  // "tracks" usa { name, id }, "stems" usa { name, hash }
  const useIdField = name === "tracks";

  useEffect(() => {
    console.log(`[MultiTrackUpload] Field "${name}" value:`, fieldValue);
  }, [fieldValue, name]);

  const { stemErrors } = useAudioValidationReady();

  const { mutateAsync: submitAudio, isPending: isSubmittingAudio } = useSubmitAudio();

  const [tracks, setTracks] = useState<Track[]>([]);

  const [tempFileNames, setTempFileNames] = useState<string[]>([]);
  const areaRef = useRef<HTMLDivElement>(null);
  const hasInitializedFromFieldValue = useRef(false);
  const lastRemovedTrackRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (
      fieldValue &&
      Array.isArray(fieldValue) &&
      fieldValue.length > 0 &&
      tracks.length === 0 &&
      !hasInitializedFromFieldValue.current &&
      !lastRemovedTrackRef.current
    ) {
      hasInitializedFromFieldValue.current = true;
      const reconstructedTracks: Track[] = fieldValue.map(
        (item: { name: string; id?: string; hash?: string }) => ({
          name: item.name,
          file: new File([], item.name),
          hash: useIdField ? item.id : item.hash || item.id,
          status: "ready",
        }),
      );
      setTracks(reconstructedTracks);
    }

    if (
      lastRemovedTrackRef.current &&
      tracks.length === 0 &&
      (!fieldValue || fieldValue.length === 0)
    ) {
      lastRemovedTrackRef.current = null;
    }
  }, [fieldValue, tracks.length, useIdField]);

  useEffect(() => {
    if (!hasInitializedFromFieldValue.current && fieldValue?.length > 0 && tracks.length === 0) {
      return;
    }

    const newFieldValue = tracks.map((track) => {
      let hashOrId = track.hash;

      if (track.tempFileName) {
        const index = tempFileNames.indexOf(track.tempFileName);
        if (index !== -1) {
          const response = audioStatusQueries[index]?.data;
          if (response?.status === "ready" && response.hash) {
            hashOrId = response.hash;
          }
        }
      }

      if (useIdField) {
        return { name: track.name, id: hashOrId };
      } else {
        return { name: track.name, hash: hashOrId };
      }
    });

    if (JSON.stringify(fieldValue) !== JSON.stringify(newFieldValue)) {
      setValue(name, newFieldValue);
    }
  }, [tracks, audioStatusQueries, tempFileNames, setValue, name, useIdField, fieldValue]);

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

  const onRemoveTrack = (trackName: string) => {
    lastRemovedTrackRef.current = trackName;

    setTracks((prevTracks) => {
      const trackToRemove = prevTracks.find((track) => track.name === trackName);
      if (trackToRemove?.tempFileName) {
        setTempFileNames((prev) =>
          prev.filter((fileName) => fileName !== trackToRemove.tempFileName),
        );
      }

      const updatedTracks = prevTracks.filter((track) => track.name !== trackName);

      if (fieldValue && Array.isArray(fieldValue)) {
        const updatedFieldValue = fieldValue.filter(
          (item: { name?: string; id?: string; hash?: string }) => item?.name !== trackName,
        );
        setValue(name, updatedFieldValue);
      }

      return updatedTracks;
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
      render={({ fieldState }) => (
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

                    // Obtener el hash/id del campo para validación
                    const fieldItem = fieldValue?.find(
                      (item: { name?: string; id?: string; hash?: string }) =>
                        item?.name === track.name,
                    );
                    const itemHash = useIdField ? fieldItem?.id : fieldItem?.hash || fieldItem?.id;

                    const validationError = itemHash ? stemErrors.get(itemHash) : undefined;

                    const hasValidationError = !!validationError;
                    const finalStatus: AudioProcessingStatus = hasValidationError
                      ? "failed"
                      : status;

                    return (
                      <DraggableTrack
                        key={track.name + i}
                        track={track}
                        onRemoveTrack={onRemoveTrack}
                        isUploading={isSubmittingAudio || isLoading}
                        status={finalStatus}
                        validationError={validationError}
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
