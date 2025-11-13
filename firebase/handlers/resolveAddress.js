/* eslint-disable @typescript-eslint/no-require-imports */
const lookupWallet = require("../libs/lookupWallet");
const { InfuraProvider, Contract } = require("ethers");
const firebase = require("firebase-admin");
const { LRUCache } = require("lru-cache");
const _ = require("lodash");

// Cached data fetching
const cache = new LRUCache({ ttl: 1000 * 30, max: 500 });
const getRolesDoc = async () => {
  if (!cache.has("rolesDoc")) {
    const db = firebase.firestore();
    const rolesDocSnap = await db.doc("globals/roles").get();
    cache.set("rolesDoc", rolesDocSnap.data());
  }
  return cache.get("rolesDoc");
};

// Role helpers
const isAdmin = async (address) => {
  const rolesDoc = await getRolesDoc();
  const admins = rolesDoc?.admins || [];
  return admins.map((a) => String(a).toLowerCase()).includes(String(address).toLowerCase());
};

const isCreator = async (address) => {
  const rolesDoc = await getRolesDoc();
  const creators = rolesDoc?.creators || [];
  return creators.map((a) => String(a).toLowerCase()).includes(String(address).toLowerCase());
};
const provider = new InfuraProvider("mainnet", process.env.INFURA_ID);

const isMember = async (address) => {
  const db = firebase.firestore();
  const settingsDoc = await db.doc("globals/settings").get();
  const { membershipContracts: contractAddresses } = settingsDoc.data() || {};
  if (!contractAddresses || !contractAddresses.length) return false;
  let isMember = false;
  for (let i in contractAddresses) {
    const contractAddress = contractAddresses[i];
    const contractInterface = new Contract(
      contractAddress,
      ["function balanceOf(address owner) external view returns (uint256 balance)"],
      provider,
    );
    const balance = await contractInterface.balanceOf(address);
    if (parseInt(balance.toString()) > 0) {
      isMember = true;
      break;
    }
  }
  return isMember;
};

const resolveAddress = async (snap) => {
  const address = snap.id;
  try {
    // Is it marked to update
    const docData = snap.data() || {};
    const isBroken = docData.errorCount > 5;
    if (isBroken) return;

    // Lookup data
    const [ensData, osData, walletIsAdmin, walletIsCreator, walletIsMember] = await Promise.all([
      lookupWallet.getEnsData(address),
      lookupWallet.getOsData(address),
      isAdmin(address),
      isCreator(address),
      isMember(address),
    ]).catch((err) => console.log(err));

    // Count session contributions
    const db = firebase.firestore();
    const countSnapshot = await db
      .collection("sessions")
      .where("collaborators", "array-contains", address)
      .count()
      .get();
    const { count } = countSnapshot.data() || {};

    // Set flag and timestamp
    let updates = {
      isAdmin: walletIsAdmin,
      isCreator: walletIsAdmin || walletIsCreator,
      isMember: walletIsAdmin || walletIsCreator || walletIsMember,
      shouldUpdate: false,
      updated: new Date(),
      sessionsContributed: count || 0,
      errorCount: 0,
      error: false,
    };
    if (ensData?.name || ensData?.avatar) updates.ens = ensData;
    if (osData) updates.openSea = osData;

    // Set when they are a member since
    if (!docData?.isMember && updates.isMember) {
      updates.memberSince = new Date();
    }

    // Update doc
    await snap.ref.set(updates, { merge: true });

    return true;
  } catch (err) {
    // Log error and write to doc
    console.log(`Error resolving identity ${address}: `, err);
    await snap.ref.set(
      {
        updated: new Date(),
        shouldUpdate: false,
        errorCount: firebase.firestore.FieldValue.increment(1),
        error: err.message,
      },
      { merge: true },
    );
  }
  return;
};

// Test or run
if (require.main === module) {
  require("../initialize");
  const db = firebase.firestore();
  db.doc("addresses/0x11Da1aCa951D649B6a2ff382Ac808aa2a776c2AA")
    .get()
    .then(resolveAddress)
    .then(() => console.log("Done."));
} else {
  module.exports = async (change) => {
    // Get value of snapshot
    const beforeSnapshot = change.before.data() || {};
    const afterSnapshot = change.after.data() || {};

    // Create entity objects
    if (afterSnapshot.shouldUpdate && !beforeSnapshot.shouldUpdate) {
      await resolveAddress(change.after);
    }
  };
}
