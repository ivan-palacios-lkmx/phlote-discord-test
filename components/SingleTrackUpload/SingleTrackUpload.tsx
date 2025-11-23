"use client";

import TrackUpload from "@/components/TrackUpload/TrackUpload";
import CloseIcon from "@/components/svg/close.svg";
import React, { useRef, useState } from "react";

import "./SingleTrackUpload.scss";

const Tooltip = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  return (
    <div className={`tooltip ${className || ""}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default function SingleTrackUpload() {
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [rawError, setRawError] = useState(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const onClick = () => {
    // Placeholder for file selection logic
    console.log("Open file dialog");
  };

  const handleProcessed = () => {
    console.log("Processed");
  };

  const handleFileClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
    setRawError(null);
  };

  return (
    <div
      className={`single-track-upload ${isOverDropZone ? "hovered" : ""} ${
        file && file.name ? "has-file" : ""
      } ${error ? "has-error" : ""}`}
      ref={areaRef}
      onClick={onClick}>
      <div className="centered">
        {!file ? (
          <pre>Drop Bounce (.wav or .mp3)</pre>
        ) : (
          <TrackUpload
            path="" // Placeholder
            file={file}
            name={file.name}>
            {error ? (
              <Tooltip className="error" onClick={(e) => e.stopPropagation()}>
                <p className="title">{error.title}</p>
                <p>{error.message}</p>
              </Tooltip>
            ) : (
              <span>✔</span>
            )}
            <button onClick={handleFileClear}>
              <CloseIcon />
            </button>
          </TrackUpload>
        )}
      </div>
    </div>
  );
}
