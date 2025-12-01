import { useSubmitAudio } from "@/hooks/query/mutations/use-submit-audio";
import { useCheckAudioStatus } from "@/hooks/query/query-hooks/use-check-audio-status";
import { AudioProcessingStatus } from "@/types/api";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

interface UseSingleTrackUploadProps {
  onChange: (value: string | undefined) => void;
  value: string | undefined;
}

export function useSingleTrackUpload({ onChange }: UseSingleTrackUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const tempFileNameRef = useRef<string | null>(null);

  const { mutateAsync: submitAudio, isPending: isSubmittingAudio } = useSubmitAudio();

  const { data: audioStatus } = useCheckAudioStatus({
    temporaryAudioFileName: tempFileNameRef.current || "",
  });

  useEffect(() => {
    if (audioStatus && audioStatus.status === "ready" && audioStatus.hash) {
      onChange(audioStatus.hash);
    }
  }, [audioStatus, onChange]);

  async function onDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;

    const droppedFile = acceptedFiles[0];
    setFile(droppedFile);
    setError(null);

    try {
      const { tmpName } = await submitAudio({ audioFile: droppedFile });
      tempFileNameRef.current = tmpName;
    } catch {
      setError({
        title: "error",
        message: "Failed to upload",
      });
      setFile(null);
      tempFileNameRef.current = null;
      onChange(undefined);
    }
  }

  const handleFileClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
    tempFileNameRef.current = null;
    onChange(undefined);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const status: AudioProcessingStatus = audioStatus?.status || "pending";
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
