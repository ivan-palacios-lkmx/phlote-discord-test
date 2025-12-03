import * as admin from "firebase-admin";
import { onObjectFinalized } from "firebase-functions/v2/storage";

import { AudioProcessor } from "./audio-processing";

admin.initializeApp();

export const processAudioUpload = onObjectFinalized(
  {
    timeoutSeconds: 300,
    memory: "2GiB",
  },
  async (event) => {
    const object = event.data;

    if (!object || !object.name) {
      console.log("No object data found.");
      return;
    }

    if (!object.name.startsWith("tmp/")) {
      console.log(`File ${object.name} is not in tmp/ folder, ignoring.`);
      return;
    }

    await AudioProcessor.processAudio(object);
  },
);
