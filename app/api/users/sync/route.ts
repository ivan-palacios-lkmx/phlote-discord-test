import { adminDb } from "@/lib/firebase-admin";
import { checkAddress } from "@/utils/auth-helpers";
// import { Contract, InfuraProvider } from "ethers"; // Commented out - Contract not used, InfuraProvider only used in commented code
import { InfuraProvider } from "ethers";
// Still needed for getEnsData
import admin from "firebase-admin";
import _ from "lodash";
import { NextRequest, NextResponse } from "next/server";

const FieldValue = admin.firestore.FieldValue;

// Helper functions for ENS and OpenSea lookup
const getEnsData = async (address: string) => {
  if (!process.env.INFURA_ID) {
    console.warn("INFURA_ID not set, skipping ENS lookup");
    return { name: false, avatar: false };
  }

  try {
    const provider = new InfuraProvider("mainnet", process.env.INFURA_ID);
    const name = await provider.lookupAddress(address);
    let avatar: string | false = false;

    if (name) {
      const avatarResult = await provider.getAvatar(name);
      avatar = avatarResult || false;
    }

    return {
      name: name || false,
      avatar: avatar,
    };
  } catch (err) {
    return { name: false, avatar: false };
  }
};

const getOsData = async (address: string) => {
  if (!process.env.OS_API_KEY) {
    return false;
  }

  const base = "https://api.opensea.io/api/v1";
  try {
    const result = await fetch(`${base}/account/${address}`, {
      headers: {
        "X-API-KEY": process.env.OS_API_KEY,
      },
    }).then((r) => r.json());

    const osUsername = _.get(result, "data.user.username");

    if (osUsername) {
      const out: { osUsername: string; profileImageURL?: string } = {
        osUsername,
      };

      // Detect custom image
      const image = _.get(result, "data.profile_img_url", "");
      if (image && !/\/opensea-static\//.test(image)) {
        out.profileImageURL = image;
      }

      return out;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

// Role helpers with caching
// const cache = new Map<string, { data: unknown; timestamp: number }>();
// const CACHE_TTL = 30 * 1000; // 30 seconds

// const getRolesDoc = async () => {
//   const cacheKey = "rolesDoc";
//   const cached = cache.get(cacheKey);

//   if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
//     return cached.data as { admins?: string[]; creators?: string[] };
//   }

//   const rolesDocSnap = await adminDb.doc("globals/roles").get();
//   const data = rolesDocSnap.data() || {};

//   cache.set(cacheKey, { data, timestamp: Date.now() });
//   return data as { admins?: string[]; creators?: string[] };
// };

// const isAdmin = async (address: string) => {
//   const rolesDoc = await getRolesDoc();
//   const admins = rolesDoc?.admins || [];
//   return admins.map((a) => String(a).toLowerCase()).includes(String(address).toLowerCase());
// };

// const isCreator = async (address: string) => {
//   const rolesDoc = await getRolesDoc();
//   const creators = rolesDoc?.creators || [];
//   return creators.map((a) => String(a).toLowerCase()).includes(String(address).toLowerCase());
// };

const isMember = async (address: string) => {
  // TODO: Replace with actual membership check logic
  // For now, hardcode a specific address to simulate membership
  const MEMBER_ADDRESS = process.env.MOCKED_ALLOWED_MEMBER_ADDRESS; // Replace with your test address
  const isMemberResult = address.toLowerCase() === MEMBER_ADDRESS?.toLowerCase();
  return isMemberResult;

  // Original logic commented out:
  // if (!process.env.INFURA_ID) {
  //   console.warn("INFURA_ID not set, skipping member check");
  //   return false;
  // }

  // const settingsDoc = await adminDb.doc("globals/settings").get();
  // const { membershipContracts: contractAddresses } = settingsDoc.data() || {};

  // if (!contractAddresses || !contractAddresses.length) return false;

  // const provider = new InfuraProvider("mainnet", process.env.INFURA_ID);

  // for (const contractAddress of contractAddresses) {
  //   try {
  //     const contractInterface = new Contract(
  //       contractAddress,
  //       ["function balanceOf(address owner) external view returns (uint256 balance)"],
  //       provider,
  //     );
  //     const balance = await contractInterface.balanceOf(address);
  //     if (parseInt(balance.toString()) > 0) {
  //       return true;
  //     }
  //   } catch (err) {
  //     console.log(`Error checking membership contract ${contractAddress}:`, err);
  //   }
  // }

  // return false;
};

export async function POST(request: NextRequest) {
  let address: string | undefined;
  try {
    const body = await request.json();
    address = body.address;

    if (!address) {
      return NextResponse.json({ error: "address is required" }, { status: 400 });
    }

    const cleanAddress = checkAddress(address);
    if (!cleanAddress) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
    }

    // Get existing document
    const addressDocRef = adminDb.doc(`addresses/${cleanAddress}`);
    const addressDocSnap = await addressDocRef.get();
    const docData = addressDocSnap.data() || {};

    // Check if document is broken (too many errors)
    const isBroken = (docData.errorCount || 0) > 5;
    if (isBroken) {
      return NextResponse.json({
        success: false,
        error: "Document has too many errors, manual intervention required",
      });
    }

    // Resolve all data in parallel
    // const [ensData, osData, walletIsAdmin, walletIsCreator, walletIsMember] = await Promise.all([
    const [ensData, osData, , , walletIsMember] = await Promise.all([
      getEnsData(cleanAddress),
      getOsData(cleanAddress),
      // isAdmin(cleanAddress), // Commented out for now
      // isCreator(cleanAddress), // Commented out for now
      Promise.resolve(false), // walletIsAdmin placeholder
      Promise.resolve(false), // walletIsCreator placeholder
      isMember(cleanAddress),
    ]).catch((err) => {
      console.error("[POST /api/users/sync] ERROR resolving address data:", err);
      return [{ name: false, avatar: false }, false, false, false, false] as const;
    });

    // Set admin and creator to false for now
    const walletIsAdmin = false;
    const walletIsCreator = false;

    // Count session contributions
    const countSnapshot = await adminDb
      .collection("sessions")
      .where("collaborators", "array-contains", cleanAddress)
      .count()
      .get();
    const { count } = countSnapshot.data() || {};

    // Build updates object
    const updates: Record<string, unknown> = {
      isAdmin: walletIsAdmin, // Always false for now
      isCreator: walletIsAdmin || walletIsCreator, // Always false for now
      isMember: walletIsMember, // Only check membership, not admin/creator
      shouldUpdate: false, // Always set to false since we're handling updates via API
      updated: FieldValue.serverTimestamp(),
      sessionsContributed: count || 0,
      errorCount: 0,
      error: false,
    };

    // Add created timestamp if this is a new document
    if (!addressDocSnap.exists) {
      updates.created = FieldValue.serverTimestamp();
    }

    // Add ENS data if available
    if (ensData && typeof ensData === "object" && (ensData.name || ensData.avatar)) {
      updates.ens = ensData;
    }

    // Add OpenSea data if available
    if (osData) {
      updates.openSea = osData;
    }

    // Set memberSince if they just became a member
    const wasMember = docData?.isMember || false;
    const isNowMember = walletIsAdmin || walletIsCreator || walletIsMember;
    if (!wasMember && isNowMember) {
      updates.memberSince = FieldValue.serverTimestamp();
    }

    // Update document
    await addressDocRef.set(updates, { merge: true });

    // Get the updated document to return
    const updatedDoc = await addressDocRef.get();
    const updatedData = updatedDoc.exists ? updatedDoc.data() : null;

    // Calculate username (shortAddress will be calculated on client if needed)
    const ensUsername = updatedData?.ens?.name;
    const zoraUsername = updatedData?.zora?.zoraUsername;
    const openSeaUsername = updatedData?.openSea?.osUsername;
    const username = ensUsername || openSeaUsername || zoraUsername || null;

    // Calculate avatar
    const avatar =
      updatedData?.ens?.avatar ||
      updatedData?.zora?.profileImageURL ||
      updatedData?.openSea?.profileImageURL ||
      null;

    // Return data at the top level, not nested
    return NextResponse.json({
      success: true,
      ...updatedData,
      username,
      avatar,
    });
  } catch (error) {
    console.error("[POST /api/users/sync] ERROR caught in catch block:", error);

    // Try to update error count if we have an address
    try {
      if (address) {
        const cleanAddress = checkAddress(address);
        if (cleanAddress) {
          const addressDocRef = adminDb.doc(`addresses/${cleanAddress}`);
          await addressDocRef.set(
            {
              updated: FieldValue.serverTimestamp(),
              shouldUpdate: false,
              errorCount: FieldValue.increment(1),
              error: error instanceof Error ? error.message : String(error),
            },
            { merge: true },
          );
        }
      }
    } catch (updateError) {
      console.error("[POST /api/users/sync] ERROR updating error count:", updateError);
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
