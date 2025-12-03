import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { AudioProcessor } from "./audio-processing";

admin.initializeApp();

// Increase timeout and memory for audio processing
const runtimeOpts = {
  timeoutSeconds: 300, // 5 minutes
  memory: "2GB" as const, // 2GB RAM
};

export const processAudioUpload = functions
  .runWith(runtimeOpts)
  .storage.object()
  .onFinalize(async (object) => {
    // Prevent infinite loops: Only process if NOT a processed result
    // AudioProcessor checks for "tmp/" folder, but this is an extra check
    if (!object.name?.startsWith("tmp/")) {
      console.log(`File ${object.name} is not in tmp/ folder, ignoring.`);
      return;
    }

    await AudioProcessor.processAudio(object);
  });
