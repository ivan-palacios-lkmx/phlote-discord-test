"use client";

import { useAddContract } from "@/hooks/query/mutations/use-add-contract";
import { useRemoveContract } from "@/hooks/query/mutations/use-remove-contract";
import { useGetSettings } from "@/hooks/query/query-hooks/use-get-settings";
import { useState } from "react";

import "./MembershipContract.scss";

export default function MembershipContract() {
  const { data: settings } = useGetSettings();
  const [newAddress, setNewAddress] = useState("");
  const { mutate: addContract } = useAddContract();
  const { mutate: removeContract } = useRemoveContract();

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAddress = newAddress.trim();
    if (!trimmedAddress) return;
    addContract(
      { contractAddress: trimmedAddress },
      {
        onSuccess: () => {
          setNewAddress("");
        },
      },
    );
  };

  const handleRemoveAddress = (address: string) => {
    removeContract({ contractAddress: address });
  };

  return (
    <div className="admin-membership-contract">
      <h6 className="area-label">Membership Contracts:</h6>

      {settings?.membershipContracts?.map((address) => (
        <div key={address} className="contract-address">
          <a
            className="current-address-link"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://etherscan.io/address/${address}`}>
            {address} ↗
          </a>
          <button
            onClick={() => handleRemoveAddress(address)}
            className="btn remove-button"
            type="button">
            Remove Address
          </button>
        </div>
      ))}

      <form onSubmit={handleAddAddress} className="set-address">
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
