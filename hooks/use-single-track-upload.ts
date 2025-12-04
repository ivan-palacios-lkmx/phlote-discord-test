import { useSubmitAudio } from "@/hooks/query/mutations/use-submit-audio";
import { useCheckAudioStatus } from "@/hooks/query/query-hooks/use-check-audio-status";
import { AudioProcessingStatus } from "@/types/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

interface UseSingleTrackUploadProps {
  onChange: (value: string | undefined) => void;
  value: string | undefined;
}

export type AudioUploadValue = string | undefined;

const STORAGE_KEY = "audio-hash-to-filename";

function getFilenameFromStorage(hash: string): string | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    const map = JSON.parse(stored);
    return map[hash] || null;
  }

  return null;
}

function saveFilenameToStorage(hash: string, filename: string): void {
  if (typeof window === "undefined") return;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  const map = stored ? JSON.parse(stored) : {};
  map[hash] = filename;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useSingleTrackUpload({ onChange, value }: UseSingleTrackUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const tempFileNameRef = useRef<string | null>(null);
  const hasBeenClearedRef = useRef(false);

  const fileFromValue = useMemo(() => {
    if (hasBeenClearedRef.current) {
      return null;
    }
    if (value && !uploadedFile && !tempFileNameRef.current) {
      const originalFilename = getFilenameFromStorage(value);
      const filename = originalFilename || "Bounce (processed)";
      return new File([], filename);
    }
    return null;
  }, [value, uploadedFile]);

  const file = uploadedFile || fileFromValue;

  useEffect(() => {
    if (value && hasBeenClearedRef.current) {
      hasBeenClearedRef.current = false;
    }
  }, [value]);

  const { mutateAsync: submitAudio, isPending: isSubmittingAudio } = useSubmitAudio();

  const { data: audioStatus } = useCheckAudioStatus({
    temporaryAudioFileName: tempFileNameRef.current || "",
  });

  useEffect(() => {
    if (audioStatus && audioStatus.status === "ready" && audioStatus.hash && uploadedFile) {
      saveFilenameToStorage(audioStatus.hash, uploadedFile.name);
      onChange(audioStatus.hash);
    }
  }, [audioStatus, onChange, uploadedFile]);

  async function onDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;

    const droppedFile = acceptedFiles[0];
    setUploadedFile(droppedFile);
    setError(null);
    hasBeenClearedRef.current = false;

    try {
      const { tmpName } = await submitAudio({ audioFile: droppedFile });
      tempFileNameRef.current = tmpName;
    } catch {
      setError({
        title: "error",
        message: "Failed to upload",
      });
      setUploadedFile(null);
      tempFileNameRef.current = null;
      onChange(undefined);
    }
  }

  const handleFileClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setError(null);
    tempFileNameRef.current = null;
    hasBeenClearedRef.current = true;
    onChange(undefined);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const status: AudioProcessingStatus =
    value && !tempFileNameRef.current ? "ready" : audioStatus?.status || "pending";
  const isProcessingFile = status === "processing";
  const hasError = status === "failed" || error !== null;

  return {
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
  };
}
