/* eslint-disable @typescript-eslint/no-require-imports */
const firebase = require("firebase-admin");

const cleanNonces = async () => {
  const db = firebase.firestore();

  // Pull expired nonces
  const qSnap = await db.collection("nonces").where("expires", "<", new Date()).limit(200).get();

  // Loop and delete any nonces
  if (!qSnap.empty) {
    const batch = db.batch();
    qSnap.forEach((snap) => {
      batch.delete(snap.ref);
    });
    await batch.commit();
    console.log(`${qSnap.docs.length} expired nonces deleted.`);
  } else {
    console.log("No expired nonces to delete.");
  }
};

// Test or run
if (require.main === module) {
  require("../initialize");
  cleanNonces().then(() => console.log("Done."));
} else {
  module.exports = cleanNonces;
}
