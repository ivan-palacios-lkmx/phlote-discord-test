import { useFbAuth } from "@/hooks/useFbAuth";
import { db, firebaseConfig } from "@/lib/firebase";
import FakeProgress from "fake-progress";
import { saveAs } from "file-saver";
import { doc, getDoc } from "firebase/firestore";
import JSZip from "jszip";
import { kebabCase } from "lodash";
import { useEffect, useRef, useState } from "react";

/**
 * Hook for Firebase endpoints
 * Provides functions to interact with Firebase Cloud Functions
 */
export function useFbEndpoints() {
  const { user } = useFbAuth();
  const [error, setError] = useState("");
  const [stemDlProgress, setStemDlProgress] = useState(0);
  const progTimerRef = useRef<NodeJS.Timeout | null>(null);

  const ep = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net`; // For production
  // const ep = `http://localhost:5000/${firebaseConfig.projectId}/us-central1`; // For local testing

  const makeHeaders = async () => {
    const headers: Record<string, string> = {};

    if (user?.value?.uid) {
      const jwtToken = await user.value.getIdToken?.();
      if (jwtToken) {
        headers.authorization = `Bearer ${jwtToken}`;
      }
    }

    return headers;
  };

  const getVersionStems = async ({
    versionID,
    action = "play",
  }: {
    versionID: string;
    action?: string;
  }) => {
    const headers = await makeHeaders();

    const response = await fetch(`${ep}/versionStems?versionID=${versionID}&action=${action}`, {
      headers,
    }).then((r) => r.json());

    if (response.success) {
      return response.data;
    } else {
      setError(response.errorMessage || "Something went wrong.");
      return false;
    }
  };

  const getApplicationTracks = async (applicationID: string) => {
    const headers = await makeHeaders();

    const response = await fetch(`${ep}/applicationTracks?applicationID=${applicationID}`, {
      headers,
    }).then((r) => r.json());

    if (response.success) {
      return response.data;
    } else {
      setError(response.errorMessage || "Something went wrong.");
      return false;
    }
  };

  const downloadStemsZip = async ({ versionID }: { versionID: string }) => {
    // Get naming data from docs
    const versionSnap = await getDoc(doc(db, `session-versions/${versionID}`));
    const versionData = versionSnap.data();
    if (!versionData) return;

    const { sessionID, stems, bpm, versionIndex } = versionData;
    const sessSnap = await getDoc(doc(db, `sessions/${sessionID}`));
    const sessionData = sessSnap.data();
    if (!sessionData) return;

    const { name } = sessionData;
    const zipName = `${kebabCase(name)}-V${versionIndex}-${bpm}BPM`;

    // Set timers
    setStemDlProgress(0);
    if (progTimerRef.current) clearInterval(progTimerRef.current);

    const jszip = new JSZip();

    // Get WAV URLs
    const stemsData = await getVersionStems({
      versionID,
      action: "download",
    });

    if (!stemsData || stemsData === false) return;

    const { bounce, stems: stemUrls } = stemsData;

    // Report progress every 0.5s
    const p = new FakeProgress({
      timeConstant: 2500 * stemUrls.length,
      autoStart: true,
    });

    progTimerRef.current = setInterval(() => {
      setStemDlProgress(p.progress);
    }, 500);

    // Download bounce
    let completeCount = 0;
    const bounceDlPromise = fetch(bounce)
      .then((r) => r.blob())
      .then((fileBlob) => {
        completeCount++;
        p.setProgress((completeCount / (stems.length + 1)) * 0.9);
        jszip.file(`bounce.wav`, fileBlob);
      });

    // Download stems
    const stemDlPromises = stemUrls
      .map(async (url: string, i: number) => {
        const fileBlob = await fetch(url).then((r) => r.blob());
        completeCount++;
        p.setProgress((completeCount / (stems.length + 1)) * 0.9);
        jszip.file(`stems/${stems[i].name}.wav`, fileBlob);
      })
      .reduce((acc, curr) => acc.then(() => curr), Promise.resolve());

    // Wait for downloads...
    await Promise.all([bounceDlPromise, stemDlPromises]);

    // Now zip it up
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

    // reset timers and things
    setStemDlProgress(1);
    p.setProgress(1);
    p.end();
    if (progTimerRef.current) clearInterval(progTimerRef.current);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progTimerRef.current) {
        clearInterval(progTimerRef.current);
      }
    };
  }, []);

  return {
    ep,
    error,
    getApplicationTracks,
    getVersionStems,
    downloadStemsZip,
    stemDlProgress,
  };
}
