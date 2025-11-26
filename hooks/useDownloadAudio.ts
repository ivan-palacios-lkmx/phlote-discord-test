import Api from "@/hooks/query/api";
import { useGetVersionAudio } from "@/hooks/query/mutations/use-get-version-audio";
import { SessionDoc } from "@/types/database";
import FakeProgress from "fake-progress";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { kebabCase } from "lodash";
import { useEffect, useRef, useState } from "react";

interface UseDownloadAudioReturn {
  downloadAudio: (versionID: string) => Promise<void>;
  progress: number;
  error: string;
  isDownloading: boolean;
}

export function useDownloadAudio(): UseDownloadAudioReturn {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const progTimerRef = useRef<NodeJS.Timeout | null>(null);
  const getVersionAudioMutation = useGetVersionAudio();

  const downloadAudio = async (versionID: string) => {
    try {
      setIsDownloading(true);
      setError("");
      setProgress(0);

      if (progTimerRef.current) clearInterval(progTimerRef.current);

      const version = await Api.getVersion(versionID);
      if (!version) {
        setError("Version not found");
        setIsDownloading(false);
        return;
      }

      const { sessionID, stems, bpm, versionIndex } = version;

      const session = await Api.getSession(sessionID);
      if (!session) {
        setError("Session not found");
        setIsDownloading(false);
        return;
      }

      const { name } = session as SessionDoc & { name: string };
      const zipName = `${kebabCase(name)}-V${versionIndex || 1}-${bpm}BPM`;

      const audioData = await getVersionAudioMutation.mutateAsync({
        versionID,
        action: "download",
      });

      if (!audioData) {
        setError("Failed to get audio URLs");
        setIsDownloading(false);
        return;
      }

      const { bounceSignedUrl, stemsSignedUrls } = audioData;

      const jszip = new JSZip();

      const totalFiles = stemsSignedUrls.length + 1;

      const p = new FakeProgress({
        timeConstant: 2500 * totalFiles,
        autoStart: true,
      });

      progTimerRef.current = setInterval(() => {
        setProgress(p.progress);
      }, 500);

      let completeCount = 0;

      const bounceDlPromise = fetch(bounceSignedUrl)
        .then((r) => r.blob())
        .then((fileBlob) => {
          completeCount++;
          p.setProgress((completeCount / totalFiles) * 0.9);
          jszip.file(`bounce.wav`, fileBlob);
        });

      const stemDlPromises = stemsSignedUrls
        .map(async (url: string, i: number) => {
          const fileBlob = await fetch(url).then((r) => r.blob());
          completeCount++;
          p.setProgress((completeCount / totalFiles) * 0.9);
          const stemName = stems[i]?.name || `stem-${i + 1}`;
          jszip.file(`stems/${stemName}.wav`, fileBlob);
        })
        .reduce((acc, curr) => acc.then(() => curr), Promise.resolve());

      await Promise.all([bounceDlPromise, stemDlPromises]);

      const blob = await jszip.generateAsync(
        {
          type: "blob",
        },
        ({ percent }) => {
          if (percent) {
            const frac = percent / 100;
            p.setProgress(0.9 + frac * 0.1);
          }
        },
      );

      if (typeof window !== "undefined") {
        saveAs(blob, `${zipName}.zip`);
      }

      setProgress(1);
      p.setProgress(1);
      p.end();
      if (progTimerRef.current) clearInterval(progTimerRef.current);
      setIsDownloading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      setIsDownloading(false);
      if (progTimerRef.current) clearInterval(progTimerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (progTimerRef.current) {
        clearInterval(progTimerRef.current);
      }
    };
  }, []);

  return {
    downloadAudio,
    progress,
    error,
    isDownloading,
  };
}
