"use client";

import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import checkAddress from "@/utils/checkAddress";
import uniq from "lodash/uniq";
import { useMemo, useState } from "react";

import "./RoleCreator.scss";

function useRolesDoc() {
  // TODO: Implement useRolesDoc hook similar to useFbGlobals
  // const rolesDocRef = useMemo(() => doc(db, "globals/roles"), []);
  // const rolesDoc = useClientDoc(rolesDocRef);
  const rolesDoc = null;

  const updateRoles = async (updates: { creators?: string[] }) => {
    // TODO: Import setDoc from firebase/firestore
    // if (rolesDocRef) {
    //   await setDoc(rolesDocRef, updates, { merge: true });
    // }
    console.log("updateRoles called with:", updates);
  };

  return { rolesDoc, updateRoles };
}

function CreatorRow({
  address,
  onRemoveCreator,
}: {
  address: string;
  onRemoveCreator: (address: string) => void;
}) {
  const {
    data: addressInfo,
    isPending: isAddressInfoPending,
    isError: isAddressInfoError,
  } = useGetAddressInfo(address, false, !!address);

  const handleRemoveCreator = () => {
    onRemoveCreator(address);
  };

  return (
    <div className="creator-row">
      {isAddressInfoPending ? (
        <div className="web3-avatar" />
      ) : isAddressInfoError ? (
        <div className="web3-avatar" />
      ) : addressInfo?.avatar ? (
        <Web3Avatar avatar={addressInfo.avatar} />
      ) : (
        <div className="web3-avatar" />
      )}
      {isAddressInfoPending ? (
        <span>Loading...</span>
      ) : isAddressInfoError ? (
        <span>Error</span>
      ) : addressInfo?.username ? (
        <Web3Username username={addressInfo.username} />
      ) : (
        <span>{address}</span>
      )}
      <button className="remove-creator" onClick={handleRemoveCreator}>
        Remove
      </button>
    </div>
  );
}

export default function RoleCreator() {
  const { rolesDoc, updateRoles } = useRolesDoc();
  const [newCreator, setNewCreator] = useState("");

  const creators = useMemo(() => {
    return (rolesDoc as { creators?: string[] } | null)?.creators || [];
  }, [rolesDoc]);

  const newCreatorFormatted = useMemo(() => {
    return checkAddress(newCreator);
  }, [newCreator]);

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCreatorFormatted) {
      alert("No valid address to add");
      return;
    }

    if (!rolesDoc) {
      alert("Data not fully loaded");
      return;
    }

    await updateRoles({
      creators: uniq([...creators, newCreatorFormatted]),
    });

    setNewCreator("");
  };

  const handleRemoveCreator = async (address: string) => {
    await updateRoles({
      creators: creators.filter((a) => a !== address),
    });
  };

  return (
    <div className="admin-role-creator">
      <h6 className="area-label">Manage Creators:</h6>

      <div className="creator-list">
        {creators.map((creator) => (
          <CreatorRow key={creator} address={creator} onRemoveCreator={handleRemoveCreator} />
        ))}
      </div>

      <form onSubmit={handleAddCreator} className="add-creator">
        <input
          type="text"
          className="text-input"
          placeholder="0xABC123..."
          value={newCreator}
          onChange={(e) => setNewCreator(e.target.value)}
        />
        <button className="add-button" type="submit">
          Add
        </button>
      </form>
    </div>
  );
}
