"use client";

import Tooltip from "@/components/Tooltip/Tooltip";
import TrackUpload from "@/components/TrackUpload/TrackUpload";
import CloseIcon from "@/components/svg/close.svg";
import { useSubmitAudio } from "@/hooks/query/mutations/use-submit-audio";
import { useCheckAudioStatus } from "@/hooks/query/query-hooks/use-check-audio-status";
import { AudioProcessingStatus } from "@/types/api";
import React, { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

import "./SingleTrackUpload.scss";

export default function SingleTrackUpload() {
  const { mutateAsync: submitAudio, isPending: isSubmittingAudio } = useSubmitAudio();
  const [file, setFile] = useState<File | null>(null);
  const [tempFileName, setTempFileName] = useState<string | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const { data: audioStatus } = useCheckAudioStatus({
    temporaryAudioFileName: tempFileName || "",
  });

  useEffect(() => {
    if (audioStatus?.status === "failed") {
      setError({
        title: "error",
        message: "error processing track",
      });
    } else if (audioStatus?.status === "ready") {
      setError(null);
    }
  }, [audioStatus]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  async function onDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;

    const droppedFile = acceptedFiles[0];
    setFile(droppedFile);
    setError(null);

    try {
      const { tmpName } = await submitAudio({ audioFile: droppedFile });
      setTempFileName(tmpName);
    } catch {
      setError({
        title: "error",
        message: "Failed to upload",
      });
      setFile(null);
      setTempFileName(null);
    }
  }

  const handleFileClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setTempFileName(null);
    setError(null);
  };

  const status: AudioProcessingStatus =
    audioStatus?.status || (tempFileName ? "pending" : "pending");

  const isProcessing = status === "processing";
  const hasError = status === "failed" || error !== null;

  return (
    <div
      className={`single-track-upload ${isDragActive ? "hovered" : ""} ${
        file && file.name ? "has-file" : ""
      } ${hasError ? "has-error" : ""}`}
      ref={areaRef}
      {...getRootProps()}
      data-lenis-prevent>
      <input {...getInputProps()} />
      <div className="centered">
        {!file ? (
          <pre>Drop Bounce (.wav or .mp3)</pre>
        ) : (
          <TrackUpload name={file.name} isUploading={isSubmittingAudio} isProcessing={isProcessing}>
            {hasError ? (
              <div onClick={(e) => e.stopPropagation()}>
                <Tooltip className="error">
                  <p className="title">{error?.title || "error"}</p>
                  <p>{error?.message || "error processing track"}</p>
                </Tooltip>
              </div>
            ) : status === "ready" ? (
              <span>✔</span>
            ) : null}
            <button onClick={handleFileClear} type="button">
              <CloseIcon />
            </button>
          </TrackUpload>
        )}
      </div>
    </div>
  );
}
