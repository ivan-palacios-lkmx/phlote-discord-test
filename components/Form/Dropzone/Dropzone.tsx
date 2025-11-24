import { useDropzone } from "react-dropzone";

interface DropzoneProps {
  onChange: (files: File[]) => void;
  value?: File[];
  dragActiveText: string;
  placeholderText: string;
}

export default function Dropzone({
  onChange,
  value,
  dragActiveText,
  placeholderText,
}: DropzoneProps) {
  function onDrop(acceptedFiles: File[]) {
    onChange(acceptedFiles);
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #cccccc",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
        background: isDragActive ? "#f0f0f0" : "transparent",
      }}>
      <input {...getInputProps()} />
      {isDragActive ? <p>{dragActiveText}</p> : <p>{placeholderText}</p>}

      {value && value.length > 0 && (
        <div style={{ marginTop: "1rem", textAlign: "left" }}>
          <strong>Archivos listos:</strong>
          <ul>
            {value.map((file: File) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
