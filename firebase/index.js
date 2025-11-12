/* eslint-disable @typescript-eslint/no-require-imports */
require("./initialize");
const authCreateToken = require("./handlers/authCreateToken");
const authCreateNonce = require("./handlers/authCreateNonce");
const resolveAddress = require("./handlers/resolveAddress");
const functions = require("firebase-functions");

/**
 * Cloud Function to create a Firebase authentication token after verifying a wallet signature.
 *
 * This endpoint verifies that a user owns a wallet address by validating a cryptographic signature
 * against a previously generated nonce message. Upon successful verification, it creates a
 * Firebase custom authentication token that can be used to authenticate the user.
 *
 * @param {object} req.query - Query parameters
 * @param {string} req.query.message - The nonce message that was signed
 * @param {string} req.query.signature - The cryptographic signature of the message
 * @param {string} req.query.address - The Ethereum wallet address
 * @returns {object} Response object with success status and token if successful
 * @returns {boolean} success - Whether the token creation was successful
 * @returns {string} [token] - Firebase custom authentication token (only if success is true)
 *
 * @example
 * GET /authCreateToken?message=0x123...&signature=0xabc...&address=0x456...
 */
exports.authCreateToken = functions
  .runWith({
    minInstances: 1,
  })
  .https.onRequest(authCreateToken);

/**
 * Cloud Function to create a nonce message for wallet signature authentication.
 *
 * This endpoint generates a unique nonce and creates a message that the user must sign
 * with their wallet. The nonce is stored in Firestore with an expiration time (1 hour).
 * The returned message should be signed by the user's wallet and then sent to authCreateToken
 * for verification.
 *
 * @param {object} req.query - Query parameters
 * @param {string} req.query.address - The Ethereum wallet address requesting the nonce
 * @returns {object} Response object with success status and message
 * @returns {boolean} success - Whether the nonce creation was successful
 * @returns {string} [message] - The message to be signed by the wallet (only if success is true)
 *
 * @example
 * GET /authCreateNonce?address=0x11Da1aCa951D649B6a2ff382Ac808aa2a776c2AA
 */
exports.authCreateNonce = functions.runWith({ minInstances: 1 }).https.onRequest(authCreateNonce);

/**
 * Cloud Function trigger that resolves wallet address metadata when an address document is updated.
 *
 * This Firestore trigger automatically runs when a document in the "addresses" collection
 * is created or updated and has the "shouldUpdate" flag set to true. It performs the following:
 * - Fetches ENS (Ethereum Name Service) data (name, avatar)
 * - Fetches OpenSea profile data
 * - Checks if the address has admin, creator, or member roles
 * - Counts session contributions
 * - Updates the document with all resolved metadata
 *
 * The function includes error handling and will increment an errorCount if resolution fails.
 *
 * @param {object} change - Firestore change event
 * @param {object} change.before - Snapshot of the document before the change
 * @param {object} change.after - Snapshot of the document after the change
 * @param {string} change.after.id - The wallet address (document ID)
 *
 * @example
 * // Triggered when a document is updated with shouldUpdate: true
 * await db.doc("addresses/0x123...").set({ shouldUpdate: true }, { merge: true });
 */
exports.resolveAddress = functions.firestore
  .document("addresses/{address}")
  .onWrite(resolveAddress);
