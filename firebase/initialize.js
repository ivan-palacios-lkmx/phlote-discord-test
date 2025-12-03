/* eslint-disable @typescript-eslint/no-require-imports */
const firebase = require("firebase-admin");

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "", "base64").toString("utf8"),
);

if (serviceAccount) {
  const projectID = serviceAccount.project_id;
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: `https://${projectID}.firebaseio.com`,
    storageBucket: `${projectID}.appspot.com`,
  });
} else {
  firebase.initializeApp();
}
