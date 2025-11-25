"use client";

import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useGetAddressInfo } from "@/hooks/query/query-hooks/use-get-address-info";
import checkAddress from "@/utils/checkAddress";
import uniq from "lodash/uniq";
import { useMemo, useState } from "react";

import "./RoleAdmin.scss";

function useRolesDoc() {
  // TODO: Implement useRolesDoc hook similar to useFbGlobals
  // const rolesDocRef = useMemo(() => doc(db, "globals/roles"), []);
  // const rolesDoc = useClientDoc(rolesDocRef);
  const rolesDoc = null;

  const updateRoles = async (updates: { admins?: string[] }) => {
    // TODO: Import setDoc from firebase/firestore
    // if (rolesDocRef) {
    //   await setDoc(rolesDocRef, updates, { merge: true });
    // }
    console.log("updateRoles called with:", updates);
  };

  return { rolesDoc, updateRoles };
}

function AdminRow({
  address,
  onRemoveAdmin,
}: {
  address: string;
  onRemoveAdmin: (address: string) => void;
}) {
  const {
    data: addressInfo,
    isPending: isAddressInfoPending,
    isError: isAddressInfoError,
  } = useGetAddressInfo(address, false, !!address);

  const handleRemoveAdmin = () => {
    onRemoveAdmin(address);
  };

  return (
    <div className="admin-row">
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
      <button className="remove-admin" onClick={handleRemoveAdmin}>
        Remove
      </button>
    </div>
  );
}

export default function RoleAdmin() {
  const { rolesDoc, updateRoles } = useRolesDoc();
  const [newAdmin, setNewAdmin] = useState("");

  const admins = useMemo(() => {
    return (rolesDoc as { admins?: string[] } | null)?.admins || [];
  }, [rolesDoc]);

  const newAdminFormatted = useMemo(() => {
    return checkAddress(newAdmin);
  }, [newAdmin]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdminFormatted) {
      alert("No valid address to add");
      return;
    }

    if (!rolesDoc) {
      alert("Data not fully loaded");
      return;
    }

    await updateRoles({
      admins: uniq([...admins, newAdminFormatted]),
    });

    setNewAdmin("");
  };

  const handleRemoveAdmin = async (address: string) => {
    await updateRoles({
      admins: admins.filter((a) => a !== address),
    });
  };

  return (
    <div className="admin-role-admin">
      <h6 className="area-label">Manage Admins:</h6>

      <div className="admin-list">
        {admins.map((admin) => (
          <AdminRow key={admin} address={admin} onRemoveAdmin={handleRemoveAdmin} />
        ))}
      </div>

      <form onSubmit={handleAddAdmin} className="add-admin">
        <input
          type="text"
          className="text-input"
          placeholder="0xABC123..."
          value={newAdmin}
          onChange={(e) => setNewAdmin(e.target.value)}
        />
        <button className="add-button" type="submit">
          Add
        </button>
      </form>
    </div>
  );
}
