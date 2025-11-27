import LoadingSpinnerIcon from "@/components/icons/LoadingSpinner";
import ProgressRingIcon from "@/components/icons/ProgressRing";

interface TrackUploadProps {
  name: string;
  children: React.ReactNode;
  isProcessing: boolean;
  isUploading: boolean;
}

export default function TrackUpload({
  name,
  children,
  isProcessing,
  isUploading,
}: TrackUploadProps) {
  return (
    <div className="track-upload">
      <div className="track">
        <span>{name} </span>
        {isUploading ? <ProgressRingIcon /> : isProcessing ? <LoadingSpinnerIcon /> : null}
        {children}
      </div>
    </div>
  );
}
