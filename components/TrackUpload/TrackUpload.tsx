import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import ProgressRingIcon from "@/components/svg/progress_ring.svg";

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
