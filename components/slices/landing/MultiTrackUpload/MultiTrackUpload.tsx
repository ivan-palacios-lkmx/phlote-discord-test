"use client";

import Tooltip from "@/components/slices/landing/Tooltip";
import TrackUpload from "@/components/slices/landing/TrackUpload";
import CloseIcon from "@/components/svg/close.svg";
import DragIcon from "@/components/svg/drag.svg";
import { kebabCase, startCase } from "lodash";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

interface Track {
  id: string;
  name: string;
  file: File;
  error?: string;
  hash?: string;
}

interface FormattedTrack {
  id: string;
  name: string;
  error?: string;
}

interface MultiTrackUploadProps {
  value: Track[];
  onChange: (tracks: FormattedTrack[]) => void;
  children: ReactNode;
  errors?: Array<{ title?: string; message?: string }>;
}

interface InternalTrack extends Track {
  path?: string;
}

export default function MultiTrackUpload({
  value,
  onChange,
  children,
  errors = [],
}: MultiTrackUploadProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [tracks, setTracks] = useState<InternalTrack[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const seed = useMemo(() => Math.random().toString(36).slice(2), []);

  // Initialize tracks from value prop on mount
  useEffect(() => {
    if (tracks.length === 0 && value.length > 0) {
      setTracks(value.map((t) => ({ ...t })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Emit formatted tracks to parent when tracks change
  const formattedTracks = useMemo<FormattedTrack[]>(
    () => tracks.map((t) => ({ name: t.name, id: t.hash || t.id, error: t.error })),
    [tracks],
  );

  useEffect(() => {
    onChange(formattedTracks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedTracks]);

  const hasError = (index: number) => {
    return !!(errors[index] || tracks[index]?.error);
  };

  const onDrop = (droppedFiles: FileList | File[]) => {
    if (!droppedFiles || droppedFiles.length === 0) return;

    const fileArray = Array.from(droppedFiles);
    const seconds = Date.now();
    const newTracks: InternalTrack[] = [];

    fileArray.forEach((file) => {
      if (!["audio/wav", "audio/mp3", "audio/mpeg"].includes(file.type)) {
        alert("Must be .wav or .mp3");
        return;
      }

      const prettyName = startCase(String(file.name).split(".")[0]);
      const safeName = kebabCase(prettyName);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      newTracks.push({
        id,
        file,
        name: prettyName,
        path: `tmp/${seed}-${safeName}-${seconds}`,
        hash: "",
      });
    });

    setTracks((prev) => [...prev, ...newTracks]);
  };

  // Drag and drop zone handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOverDropZone(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOverDropZone(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOverDropZone(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      onDrop(droppedFiles);
    }
  };

  // File dialog handlers
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onDrop(files);
    }
    // Reset input value so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (tracks.length === 0) {
      openFileDialog();
    } else {
      e.stopPropagation();
    }
  };

  // Track removal
  const onRemoveTrack = (index: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  };

  // Track processing callbacks
  const handleTrackProcessed = (index: number, hash: string) => {
    setTracks((prev) => prev.map((track, i) => (i === index ? { ...track, hash } : track)));
  };

  const handleTrackError = (index: number, error: string) => {
    setTracks((prev) => prev.map((track, i) => (i === index ? { ...track, error } : track)));
  };

  // Drag and drop for reordering
  const handleTrackDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleTrackDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(index);
  };

  const handleTrackDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleTrackDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setTracks((prev) => {
      const newTracks = [...prev];
      const [draggedTrack] = newTracks.splice(draggedIndex, 1);
      newTracks.splice(dropIndex, 0, draggedTrack);
      return newTracks;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div
      className={`multi-track-upload ${isOverDropZone ? "hovered" : ""} ${tracks.length > 0 ? "has-files" : ""}`}
      ref={areaRef}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-lenis-prevent>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/wav,audio/mp3,audio/mpeg"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!tracks.length ? (
        <div className="centered">{children || <span>Drop Stems (.wav or .mp3)</span>}</div>
      ) : (
        <div className="draggable">
          {tracks.map((track, i) => (
            <div
              key={`${track.name}-${i}`}
              className={`uploaded-track ${hasError(i) ? "has-error" : ""}`}
              draggable
              onDragStart={() => handleTrackDragStart(i)}
              onDragOver={(e) => handleTrackDragOver(e, i)}
              onDragLeave={handleTrackDragLeave}
              onDrop={(e) => handleTrackDrop(e, i)}
              onClick={(e) => e.stopPropagation()}>
              <button type="button" className="drag">
                <DragIcon />
              </button>

              <TrackUpload
                className="progress"
                track={track}
                onProcessed={(hash) => handleTrackProcessed(i, hash)}
                onError={(error) => handleTrackError(i, error)}>
                {hasError(i) && (
                  <Tooltip className="error">
                    <p className="title">{errors[i]?.title}</p>
                    <p>{errors[i]?.message}</p>
                  </Tooltip>
                )}
              </TrackUpload>

              {(track.hash || track.error) && (
                <button type="button" className="close" onClick={() => onRemoveTrack(i)}>
                  <CloseIcon />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
