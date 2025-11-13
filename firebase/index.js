/* eslint-disable @typescript-eslint/no-require-imports */
require("./initialize");
const resolveAddress = require("./handlers/resolveAddress");
const functions = require("firebase-functions");

/*
 * ==================
 *  Firestore Triggers
 * ==================
 */

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
