"use client";

import Tooltip from "@/components/Tooltip/Tooltip";
import TrackUpload from "@/components/TrackUpload/TrackUpload";
import CloseIcon from "@/components/svg/close.svg";
import { type AudioUploadValue, useSingleTrackUpload } from "@/hooks/use-single-track-upload";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

import "./SingleTrackUpload.scss";

interface SingleTrackUploadProps {
  name: string;
}

interface SingleTrackUploadFieldProps {
  onChange: (value: AudioUploadValue | undefined) => void;
  value: AudioUploadValue | undefined;
}

function SingleTrackUploadField({ onChange, value }: SingleTrackUploadFieldProps) {
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
  } = useSingleTrackUpload({ onChange, value });

  const dropzoneClasses = [
    "single-track-upload",
    isDragActive && "hovered",
    file?.name && "has-file",
    hasError && "has-error",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={dropzoneClasses} ref={areaRef} {...getRootProps()} data-lenis-prevent>
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

export default function SingleTrackUpload({ name }: SingleTrackUploadProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <SingleTrackUploadField onChange={field.onChange} value={field.value} />
      )}
    />
  );
}
