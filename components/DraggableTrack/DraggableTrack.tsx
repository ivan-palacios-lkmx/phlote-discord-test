import { Track } from "@/components/MultiTrackUpload/MultiTrackUpload";
import Tooltip from "@/components/Tooltip/Tooltip";
import TrackUpload from "@/components/TrackUpload/TrackUpload";
import CloseIcon from "@/components/svg/close.svg";
import DragIcon from "@/components/svg/drag.svg";
import { useSortable } from "@dnd-kit/sortable";

interface DraggableTrackProps {
  track: Track;
  i: number;
  hasError: (i: number) => boolean;
  error: { title: string; message: string } | null;
  onRemoveTrack: (i: number) => void;
  isUploading: boolean;
  isProcessing: boolean;
}

export default function DraggableTrack({
  track,
  i,
  hasError,
  error,
  onRemoveTrack,
  isUploading,
  isProcessing,
}: DraggableTrackProps) {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: track.name,
  });
  return (
    <div
      key={track.name + i}
      className={`uploaded-track ${hasError(i) ? "has-error" : ""}`}
      onClick={(e) => e.stopPropagation()}
      ref={setNodeRef}
      {...attributes}
      {...listeners}>
      <button type="button" className="drag">
        <DragIcon />
      </button>
      <TrackUpload name={track.name} isUploading={isUploading} isProcessing={isProcessing}>
        {hasError(i) && error && (
          <Tooltip className="error">
            <p className="title">{error.title}</p>
            <p>{error.message}</p>
          </Tooltip>
        )}
      </TrackUpload>

      <button onClick={() => onRemoveTrack(i)} type="button" className="close">
        <CloseIcon />
      </button>
    </div>
  );
}
