import serviceAccount from "@/firebase/service-account.json";
import admin from "firebase-admin";

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
