import admin from "firebase-admin";

const SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!SERVICE_ACCOUNT) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
}

const serviceAccount = JSON.parse(Buffer.from(SERVICE_ACCOUNT, "base64").toString("utf8"));

// TODO: Prevent multiple initializations of the admin app
if (!admin.apps.length) {
  if (serviceAccount) {
    const projectID = serviceAccount.project_id;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://${projectID}.firebaseio.com`,
      storageBucket: `${projectID}.appspot.com`,
    });
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
