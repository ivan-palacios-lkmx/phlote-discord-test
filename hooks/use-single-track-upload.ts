import { useSubmitAudio } from "@/hooks/query/mutations/use-submit-audio";
import { useCheckAudioStatus } from "@/hooks/query/query-hooks/use-check-audio-status";
import { AudioProcessingStatus } from "@/types/api";
import { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

export interface AudioUploadValue {
  id: string;
  status: AudioProcessingStatus;
}

interface UseSingleTrackUploadProps {
  onChange: (value: AudioUploadValue | undefined) => void;
  value: AudioUploadValue | undefined;
}

export function useSingleTrackUpload({ onChange, value }: UseSingleTrackUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const currentValue = value;
  const tempFileName = currentValue?.id;

  const { mutateAsync: submitAudio, isPending: isSubmittingAudio } = useSubmitAudio();

  const { data: audioStatus } = useCheckAudioStatus({
    temporaryAudioFileName: tempFileName || "",
  });

  async function onDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return;

    const droppedFile = acceptedFiles[0];
    setFile(droppedFile);
    setError(null);

    try {
      const { tmpName, status } = await submitAudio({ audioFile: droppedFile });
      onChange({ id: tmpName, status });
    } catch {
      setError({
        title: "error",
        message: "Failed to upload",
      });
      setFile(null);
      onChange(undefined);
    }
  }

  const handleFileClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
    onChange(undefined);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const status: AudioProcessingStatus = audioStatus?.status || currentValue?.status || "pending";
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
