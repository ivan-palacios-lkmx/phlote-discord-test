import { Track } from "@/components/MultiTrackUpload/MultiTrackUpload";
import Tooltip from "@/components/Tooltip/Tooltip";
import TrackUpload from "@/components/TrackUpload/TrackUpload";
import CloseIcon from "@/components/icons/Close";
import DragIcon from "@/components/icons/Drag";
import { AudioProcessingStatus } from "@/types/api";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DraggableTrackProps {
  track: Track;
  onRemoveTrack: (name: string) => void;
  status: AudioProcessingStatus;
  isUploading: boolean;
  validationError?: string;
}

export default function DraggableTrack({
  track,
  status,
  onRemoveTrack,
  isUploading,
  validationError,
}: DraggableTrackProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: track.name,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasError = status === "failed";

  const isProcessing = status === "processing";

  const errorMessage = validationError || (hasError ? "error processing track" : undefined);

  console.log("errorMessage", errorMessage);

  return (
    <div
      key={track.name}
      className={`uploaded-track ${hasError ? "has-error" : ""}`}
      onClick={(e) => e.stopPropagation()}
      ref={setNodeRef}
      style={style}
      {...attributes}>
      <button type="button" className="drag" {...listeners}>
        <DragIcon />
      </button>
      <TrackUpload name={track.name} isUploading={isUploading} isProcessing={isProcessing}>
        {errorMessage && (
          <Tooltip className="error">
            <p className="title">error</p>
            <p>{errorMessage}</p>
          </Tooltip>
        )}
      </TrackUpload>

      <button
        onClick={() => {
          onRemoveTrack(track.name);
        }}
        type="button"
        className="close">
        <CloseIcon />
      </button>
    </div>
  );
}
