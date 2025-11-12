/* eslint-disable @typescript-eslint/no-require-imports */
const createSigMessage = require("../libs/createSigMessage");
const checkAddress = require("../libs/checkAddress");
const cleanNonces = require("../libs/cleanNonces");
const firebase = require("firebase-admin");
const cors = require("cors")();

const LIFESPAN_MS = 1 * 60 * 60 * 1000; // 1 hour

const createNonce = async ({ address }) => {
  try {
    address = checkAddress(address);
    if (!address) throw new Error("No address provided.");
    const db = firebase.firestore();
    const hex = Date.now().toString(16).slice(-6);
    const nonce = `0x${hex}`;

    const message = createSigMessage(nonce);

    await db.doc(`nonces/${address}:${nonce}`).set({
      created: new Date(),
      expires: new Date(Date.now() + LIFESPAN_MS),
      address,
      message,
      nonce,
    });

    // Clean out old
    // nonces async
    cleanNonces();

    return message;
  } catch (err) {
    console.log(`Error creating nonce: `, err);
    cleanNonces();
    return false;
  }
};

// Test or run
if (require.main === module) {
  require("../initialize");
  createNonce({
    address: "0x11Da1aCa951D649B6a2ff382Ac808aa2a776c2AA",
  }).then((message) => {
    console.log("Got message: ", message);
  });
} else {
  module.exports = (req, res) => {
    cors(req, res, async () => {
      try {
        const address = req.query.address;
        if (!address) throw new Error("No address provided.");
        const message = await createNonce({ address });
        return res.send({ success: true, message });
      } catch (err) {
        console.log(`Error creating nonce: `, err);
        return res.send({ success: false });
      }
    });
  };
}
