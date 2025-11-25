"use client";

import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { AddressDocWithID } from "@/types/database";
import checkAddress from "@/utils/checkAddress";
import { useMemo, useState } from "react";

import "./RoleCreator.scss";

function CreatorRow({
  address,
  onRemoveCreator,
  isLoadingUsers,
}: {
  address: AddressDocWithID;
  onRemoveCreator: (address: AddressDocWithID) => void;
  isLoadingUsers: boolean;
}) {
  const creatorAvatar =
    address?.ens?.avatar ||
    address?.openSea?.profileImageURL ||
    address?.zora?.profileImageURL ||
    "/images/phlote-poster.jpg";
  return (
    <div className="creator-row">
      {isLoadingUsers ? <div className="web3-avatar" /> : <Web3Avatar avatar={creatorAvatar} />}
      <button className="remove-creator" onClick={() => onRemoveCreator(address)}>
        Remove
      </button>
    </div>
  );
}

interface RoleCreatorProps {
  creators: AddressDocWithID[];
  isLoadingUsers: boolean;
}

export default function RoleCreator({ creators, isLoadingUsers }: RoleCreatorProps) {
  const [newCreator, setNewCreator] = useState("");

  const newCreatorFormatted = useMemo(() => {
    return checkAddress(newCreator);
  }, [newCreator]);

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCreatorFormatted) {
      alert("No valid address to add");
      return;
    }

    setNewCreator("");
  };

  const handleRemoveCreator = async (address: AddressDocWithID) => {};

  return (
    <div className="admin-role-creator">
      <h6 className="area-label">Manage Creators:</h6>

      <div className="creator-list">
        {creators.map((creator) => (
          <CreatorRow
            key={creator.id}
            address={creator}
            onRemoveCreator={handleRemoveCreator}
            isLoadingUsers={isLoadingUsers}
          />
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
