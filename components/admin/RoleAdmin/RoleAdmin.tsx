"use client";

import Form from "@/components/Form/Form";
import { Input } from "@/components/Form/Input/Input";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { AddressDocWithID } from "@/types/database";
import { transformToShortAddress } from "@/utils/functions";
import { addAdminSchema } from "@/utils/zod-schemas";
import { z } from "zod";

import "./RoleAdmin.scss";

function AdminRow({
  address,
  onRemoveAdmin,
  isLoadingUsers,
}: {
  address: AddressDocWithID;
  onRemoveAdmin: (address: AddressDocWithID) => void;
  isLoadingUsers: boolean;
}) {
  const adminAvatar =
    address?.ens?.avatar ||
    address?.openSea?.profileImageURL ||
    address?.zora?.profileImageURL ||
    "/images/phlote-poster.jpg";
  const adminUsername =
    address?.ens?.name ||
    address?.openSea?.osUsername ||
    address?.zora?.zoraUsername ||
    transformToShortAddress(address?.id);
  return (
    <div className="admin-row">
      {isLoadingUsers ? (
        <div className="web3-avatar" />
      ) : (
        <>
          <Web3Avatar avatar={adminAvatar} />
          <Web3Username username={adminUsername} />
        </>
      )}
      <button className="remove-admin" onClick={() => onRemoveAdmin(address)}>
        Remove
      </button>
    </div>
  );
}

interface RoleAdminProps {
  admins: AddressDocWithID[];
  isLoadingUsers: boolean;
  onRemoveAdmin: (address: AddressDocWithID) => void;
  onAddAdmin: (formValues: z.infer<typeof addAdminSchema>) => void;
}

export default function RoleAdmin({
  admins,
  isLoadingUsers,
  onRemoveAdmin,
  onAddAdmin,
}: RoleAdminProps) {
  function handleAddAdmin(formValues: z.infer<typeof addAdminSchema>) {
    onAddAdmin(formValues);
  }

  const handleRemoveAdminClick = (address: AddressDocWithID) => {
    onRemoveAdmin(address);
  };

  return (
    <div className="admin-role-admin">
      <h6 className="area-label">Manage Admins:</h6>

      <div className="admin-list">
        {admins.map((admin) => (
          <AdminRow
            key={admin.id}
            address={admin}
            onRemoveAdmin={handleRemoveAdminClick}
            isLoadingUsers={isLoadingUsers}
          />
        ))}
      </div>

      <Form schema={addAdminSchema} handleSubmit={handleAddAdmin} className="add-admin">
        <Input name="address" type="text" className="text-input" placeholder="0xABC123..." />
        <button className="add-button" type="submit">
          Add
        </button>
      </Form>
    </div>
  );
}
