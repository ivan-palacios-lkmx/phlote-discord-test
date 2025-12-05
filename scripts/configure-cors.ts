import serviceAccount from "@/firebase/service-account.json";
import * as admin from "firebase-admin";

// Get the bucket name from the service account project ID
const projectId = serviceAccount.project_id;
const bucketName = `${projectId}.appspot.com`;

// Initialize the admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: bucketName,
  });
}

async function configureCors() {
  try {
    const bucket = admin.storage().bucket();

    await bucket.setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ["GET", "HEAD", "PUT", "POST", "DELETE"],
        origin: [
          "http://localhost:3000",
          "https://phlote.vercel.app",
          "https://phlote-staging.vercel.app",
          "https://phlote.xyz",
          "https://phlote-staging-git-fix-discord-og-hugocoronas-projects.vercel.app",
          // Add any other production domains here if needed
        ],
        responseHeader: [
          "Content-Type",
          "Access-Control-Allow-Origin",
          "x-goog-resumable",
          "Content-Length",
          "Content-Disposition",
          "Cache-Control",
          "ETag",
        ],
      },
    ]);
  } catch (error) {}
}

configureCors();
