import LoadingSpinnerIcon from "@/components/svg/loading_spinner.svg";
import ProgressRingIcon from "@/components/svg/progress_ring.svg";

interface TrackUploadProps {
  name: string;
  file: object;
  path: string;
  children: React.ReactNode;
}

export default function TrackUpload({ name, file, path, children }: TrackUploadProps) {
  return (
    <div className="track-upload">
      <div className="track">
        <span>{name} </span>
        <ProgressRingIcon />

        <LoadingSpinnerIcon />

        {children}
      </div>
    </div>
  );
}
