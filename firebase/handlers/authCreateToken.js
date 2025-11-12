/* eslint-disable @typescript-eslint/no-require-imports */
const checkAddress = require("../libs/checkAddress");
const firebase = require("firebase-admin");
const { ethers } = require("ethers");
const cors = require("cors")();

// PRIMARY HANDLER:
// Given a message, wallet, and signature, verify the signature
// and create a FB auth token for the user to log in with.
const requestToken = async ({ message, signature, address }) => {
  try {
    address = checkAddress(address);

    // Validate
    if (!message) throw new Error("No message provided.");
    if (!signature) throw new Error("No signature provided.");
    if (!address) throw new Error("No address provided.");

    // Check nonce with DB to validate.
    const db = firebase.firestore();
    const nonceDocQ = await db
      .collection(`nonces`)
      .where("message", "==", message)
      .where("address", "==", address)
      .get();
    const docSnap = nonceDocQ.docs[0];
    if (!docSnap) throw new Error("Invalid data provided.");
    const docData = docSnap.data();
    const expires = docData.expires && docData.expires.toDate();

    // Validate doc data
    if (docData.address !== address) throw new Error("Invalid address.");
    if (docData.message !== message) throw new Error("Invalid address.");
    if (expires < new Date()) throw new Error("Nonce has expired.");

    // Get address of signer
    const signerAddress = ethers.verifyMessage(docData.message, signature);

    // Verify that signer is provided address.
    if (signerAddress !== address) throw new Error("Invalid signature.");

    // Delete nonce
    await docSnap.ref.delete();

    // Issue auth token for frontend and return
    return firebase.auth().createCustomToken(address);
  } catch (err) {
    console.log(`Error requesting token: `, err.message);
    return false;
  }
  return;
};

// Test or run
if (require.main === module) {
  require("../initialize");
  requestToken({
    message: "",
    address: "",
    signature: "",
  }).then((token) => {
    console.log("Got token: ", token);
  });
} else {
  module.exports = (req, res) => {
    cors(req, res, async () => {
      try {
        const { message, signature, address } = req.query;

        const token = await requestToken({
          message,
          signature,
          address,
        });
        if (!token) throw new Error("No token.");
        return res.send({ success: true, token });
      } catch (err) {
        console.log(`Error getting token: `, err.message);
        return res.send({ success: false });
      }
    });
  };
}
