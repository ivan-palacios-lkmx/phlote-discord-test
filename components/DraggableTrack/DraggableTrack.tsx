import { Track } from "@/components/MultiTrackUpload/MultiTrackUpload";
import Tooltip from "@/components/Tooltip/Tooltip";
import TrackUpload from "@/components/TrackUpload/TrackUpload";
import CloseIcon from "@/components/icons/Close";
import DragIcon from "@/components/icons/Drag";
import { AudioProcessingStatus } from "@/types/api";
import { useSortable } from "@dnd-kit/sortable";

interface DraggableTrackProps {
  track: Track;
  onRemoveTrack: (name: string) => void;
  status: AudioProcessingStatus;
  isUploading: boolean;
}

export default function DraggableTrack({
  track,
  status,
  onRemoveTrack,
  isUploading,
}: DraggableTrackProps) {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: track.name,
  });

  const hasError = status === "failed";

  const isProcessing = status === "processing";

  return (
    <div
      key={track.name}
      className={`uploaded-track ${hasError ? "has-error" : ""}`}
      onClick={(e) => e.stopPropagation()}
      ref={setNodeRef}
      {...attributes}>
      <button type="button" className="drag" {...listeners}>
        <DragIcon />
      </button>
      <TrackUpload name={track.name} isUploading={isUploading} isProcessing={isProcessing}>
        {hasError && (
          <Tooltip className="error">
            <p className="title">error</p>
            <p>error processing track</p>
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
