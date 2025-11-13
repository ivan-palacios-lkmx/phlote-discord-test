/* eslint-disable @typescript-eslint/no-require-imports */
const firebase = require("firebase-admin");
const serviceAccount = require("./service-account.json");

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
