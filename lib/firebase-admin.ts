import serviceAccount from "@/firebase/service-account.json";
import admin from "firebase-admin";

if (!admin.apps.length) {
  if (serviceAccount) {
    const projectID = serviceAccount.project_id;
    console.log("[firebase-admin] Project ID:", projectID);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: `https://${projectID}.firebaseio.com`,
      storageBucket: `${projectID}.appspot.com`,
    });
    console.log("[firebase-admin] Firebase Admin initialized with service account");
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
