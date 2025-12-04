/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import {onSchedule} from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

const executeCronLogic = async (scheduleTime?: string, jobName?: string) => {
  const timestamp = new Date().toISOString();
  logger.info("=== CRON JOB EXECUTED ===", {
    functionName: "basicCron",
    timestamp,
    scheduleTime: scheduleTime || "manual",
    jobName: jobName || "test",
  });
  logger.info("Cron job completed successfully");
};

export const basicCron = onSchedule("0 * * * *", async (event) => {
  await executeCronLogic(event.scheduleTime, event.jobName);
});

export const testCron = onRequest(async (request, response) => {
  await executeCronLogic();
  response.json({success: true, message: "Cron logic executed successfully"});
});
