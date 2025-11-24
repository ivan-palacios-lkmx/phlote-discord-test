import { useSubmitAudio } from "@/hooks/query/mutations/use-submit-audio";
import { useCheckAudioStatus } from "@/hooks/query/query-hooks/use-check-audio-status";
import { AudioProcessingStatus } from "@/types/api";
import { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";

interface UseSingleTrackUploadProps {
  name: string;
}

export function useSingleTrackUpload({ name }: UseSingleTrackUploadProps) {
  if (!name) {
    throw new Error("useSingleTrackUpload requires a 'name' prop");
  }

  const { setValue, watch } = useFormContext();
  if (!setValue || !watch) {
    throw new Error("useSingleTrackUpload must be used within a FormProvider");
  }

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  const currentValue = watch(name);
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
      setValue(name, { id: tmpName, status });
    } catch {
      setError({
        title: "error",
        message: "Failed to upload",
      });
      setFile(null);
      setValue(name, undefined);
    }
  }

  const handleFileClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError(null);
    setValue(name, undefined);
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
