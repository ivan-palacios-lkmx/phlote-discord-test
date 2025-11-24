"use client";

import Tooltip from "@/components/Tooltip/Tooltip";
import TrackUpload from "@/components/TrackUpload/TrackUpload";
import CloseIcon from "@/components/svg/close.svg";
import { useSingleTrackUpload } from "@/hooks/use-single-track-upload";
import React from "react";

import "./SingleTrackUpload.scss";

interface SingleTrackUploadProps {
  name: string;
}

export default function SingleTrackUpload({ name }: SingleTrackUploadProps) {
  const {
    file,
    error,
    areaRef,
    status,
    isProcessingFile,
    hasError,
    isSubmittingAudio,
    getRootProps,
    getInputProps,
    isDragActive,
    handleFileClear,
  } = useSingleTrackUpload({ name });

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
          <TrackUpload
            name={file.name}
            isUploading={isSubmittingAudio}
            isProcessing={isProcessingFile}>
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
