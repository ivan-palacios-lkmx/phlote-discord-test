"use client";

import { useState } from "react";

export default function DemoAudioUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    tmpName?: string;
    status?: string;
    error?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setResult({ error: "Please select a file" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const response = await fetch("/api/audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({ error: data.error || "Failed to upload audio" });
      } else {
        setResult({ tmpName: data.tmpName, status: data.status });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>Audio Upload Demo</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="audio-file" style={{ display: "block", marginBottom: "0.5rem" }}>
            Select Audio File (.wav or .mp3)
          </label>
          <input
            id="audio-file"
            type="file"
            accept="audio/wav,audio/mp3,audio/mpeg"
            onChange={handleFileChange}
            disabled={loading}
            style={{ width: "100%" }}
          />
          {file && (
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#666" }}>
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
          }}>
          {loading ? "Uploading..." : "Upload Audio"}
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            borderRadius: "4px",
            backgroundColor: result.error ? "#fee" : "#efe",
            border: `1px solid ${result.error ? "#fcc" : "#cfc"}`,
          }}>
          {result.error ? (
            <div>
              <h3 style={{ color: "#c00", marginTop: 0 }}>Error</h3>
              <p style={{ margin: 0 }}>{result.error}</p>
            </div>
          ) : (
            <div>
              <h3 style={{ color: "#0c0", marginTop: 0 }}>Success</h3>
              <p style={{ margin: "0.5rem 0" }}>
                <strong>Status:</strong> {result.status}
              </p>
              {result.tmpName && (
                <p style={{ margin: "0.5rem 0" }}>
                  <strong>Temporary Name:</strong> {result.tmpName}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
