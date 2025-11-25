"use client";

import { useFbGlobals } from "@/hooks/useFbGlobals";
import { db } from "@/lib/firebase";
import checkAddress from "@/utils/checkAddress";
import { collection, getDocs, query, writeBatch } from "firebase/firestore";
import chunk from "lodash/chunk";
import { useMemo, useState } from "react";

import "./MembershipContract.scss";

export default function MembershipContract() {
  const { settingsDoc, updateSettings } = useFbGlobals();
  const [newAddress, setNewAddress] = useState("");

  const currentAddresses = useMemo(() => {
    return (settingsDoc as { membershipContracts?: string[] } | null)?.membershipContracts || [];
  }, [settingsDoc]);

  const newAddressFormatted = useMemo(() => {
    return checkAddress(newAddress);
  }, [newAddress]);

  const refreshAddresses = async () => {
    const memberQ = await getDocs(query(collection(db, "addresses")));

    chunk(Array.from(memberQ.docs), 200).forEach(async (memberBatch) => {
      const batch = writeBatch(db);

      memberBatch.forEach((addressSnap) => {
        batch.set(addressSnap.ref, { shouldUpdate: false }, { merge: true });
      });

      await batch.commit().then(async () => {
        await new Promise((res) => setTimeout(res, 1500));
        const secondBatch = writeBatch(db);
        memberBatch.forEach((addressSnap) => {
          secondBatch.set(addressSnap.ref, { shouldUpdate: true }, { merge: true });
        });
        return secondBatch.commit();
      });
    });
    console.log("DONE");
  };

  const onSetAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAddressFormatted) {
      alert("No valid address provided");
      return;
    }

    if (!settingsDoc) {
      alert("Data not fully loaded yet");
      return;
    }

    await updateSettings({
      membershipContracts: [...currentAddresses, newAddressFormatted],
    });

    setNewAddress("");

    await refreshAddresses();
  };

  const onRemoveAddress = async (address: string) => {
    if (!settingsDoc) {
      alert("Data not fully loaded yet");
      return;
    }

    await updateSettings({
      membershipContracts: currentAddresses.filter((a) => a !== address),
    });

    await refreshAddresses();
  };

  return (
    <div className="admin-membership-contract">
      <h6 className="area-label">Membership Contracts:</h6>

      {currentAddresses.map((address) => (
        <div key={address} className="contract-address">
          <a
            className="current-address-link"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://etherscan.io/address/${address}`}>
            {address} ↗
          </a>
          <button
            onClick={() => onRemoveAddress(address)}
            className="btn remove-button"
            type="button">
            Remove Address
          </button>
        </div>
      ))}

      <form onSubmit={onSetAddress} className="set-address">
        <input
          type="text"
          className="text-input"
          placeholder="0xABC123..."
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
        />
        <button className="add-button" type="submit">
          Add Contract Address
        </button>
      </form>
    </div>
  );
}
