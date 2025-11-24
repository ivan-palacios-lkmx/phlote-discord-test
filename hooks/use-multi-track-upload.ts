import { useSubmitAudio } from "@/hooks/query/mutations/use-submit-audio";
import { useCheckMultipleAudioStatus } from "@/hooks/query/query-hooks/use-check-multiple-audio-status";
import { AudioProcessingStatusResponse } from "@/types/api";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";

interface UseMultiTrackUploadProps {
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

export function useMultiTrackUpload({ name }: UseMultiTrackUploadProps) {
  if (!name) {
    throw new Error("useMultiTrackUpload requires a 'name' prop");
  }

  const { setValue } = useFormContext();
  if (!setValue) {
    throw new Error("useMultiTrackUpload must be used within a FormProvider");
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

  return {
    tracks,
    tempFileNames,
    areaRef,
    audioStatusQueries,
    isSubmittingAudio,
    getRootProps,
    getInputProps,
    isDragActive,
    onRemoveTrack,
  };
}
