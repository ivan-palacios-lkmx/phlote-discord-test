"use client";

import Tooltip from "@/components/Tooltip/Tooltip";
import TrackUpload from "@/components/TrackUpload/TrackUpload";
import CloseIcon from "@/components/svg/close.svg";
import DragIcon from "@/components/svg/drag.svg";
import React, { useRef, useState } from "react";

import "./MultiTrackUpload.scss";

interface Track {
  name: string;
  file: any; // Placeholder for File object
  path?: string;
  hash?: string;
  error?: string;
}

export default function MultiTrackUpload() {
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  // Placeholder tracks state
  const [tracks, setTracks] = useState<Track[]>([]);
  const areaRef = useRef<HTMLDivElement>(null);

  const open = () => {
    console.log("Open file dialog");
    // For testing purposes, let's add a dummy track on click if empty
    if (tracks.length === 0) {
      setTracks([
        { name: "Bass.wav", file: {}, path: "" },
        { name: "Drums.wav", file: {}, path: "" },
      ]);
    }
  };

  const onRemoveTrack = (index: number) => {
    const newTracks = [...tracks];
    newTracks.splice(index, 1);
    setTracks(newTracks);
  };

  const hasError = (index: number) => {
    return !!tracks[index]?.error;
  };

  const getError = (index: number) => {
    const error = tracks[index]?.error;
    return error ? { title: "Error", message: error } : null;
  };

  return (
    <div
      className={`multi-track-upload ${isOverDropZone ? "hovered" : ""} ${
        tracks.length ? "has-files" : ""
      }`}
      ref={areaRef}
      onClick={open}
      data-lenis-prevent>
      {!tracks.length ? (
        <div className="centered">
          <span>Drop Stems (.wav or .mp3)</span>
        </div>
      ) : (
        // Placeholder for draggable list (e.g., dnd-kit or react-beautiful-dnd)
        <div className="draggable">
          {tracks.map((track, i) => {
            const error = getError(i);
            return (
              <div
                key={track.name + i}
                className={`uploaded-track ${hasError(i) ? "has-error" : ""}`}
                onClick={(e) => e.stopPropagation()}>
                <button type="button" className="drag">
                  <DragIcon />
                </button>

                <TrackUpload
                  name={track.name}
                  file={track.file}
                  path={track.path || ""}
                  // Placeholder for event handlers
                  // onProcessed={(hash) => { ... }}
                  // onError={(err) => { ... }}
                >
                  {hasError(i) && error && (
                    <Tooltip className="error">
                      <p className="title">{error.title}</p>
                      <p>{error.message}</p>
                    </Tooltip>
                  )}
                </TrackUpload>

                <button onClick={() => onRemoveTrack(i)} type="button" className="close">
                  <CloseIcon />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
