"use client";

import Form from "@/components/Form/Form";
import { Input } from "@/components/Form/Input/Input";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { AddressDocWithID } from "@/types/database";
import { transformToShortAddress } from "@/utils/functions";
import { addCreatorSchema } from "@/utils/zod-schemas";
import { z } from "zod";

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

  const creatorUsername =
    address?.ens?.name ||
    address?.openSea?.osUsername ||
    address?.zora?.zoraUsername ||
    transformToShortAddress(address?.id);

  return (
    <div className="creator-row">
      {isLoadingUsers ? (
        <div className="web3-avatar" />
      ) : (
        <>
          <Web3Avatar avatar={creatorAvatar} />
          <Web3Username username={creatorUsername} />
        </>
      )}
      <button className="remove-creator" onClick={() => onRemoveCreator(address)}>
        Remove
      </button>
    </div>
  );
}

interface RoleCreatorProps {
  creators: AddressDocWithID[];
  isLoadingUsers: boolean;
  onRemoveCreator: (address: AddressDocWithID) => void;
  onAddCreator: (formValues: z.infer<typeof addCreatorSchema>) => void;
}

export default function RoleCreator({
  creators,
  isLoadingUsers,
  onRemoveCreator,
  onAddCreator,
}: RoleCreatorProps) {
  const handleRemoveCreatorClick = (address: AddressDocWithID) => {
    onRemoveCreator(address);
  };

  return (
    <div className="admin-role-creator">
      <h6 className="area-label">Manage Creators:</h6>

      <div className="creator-list">
        {creators.map((creator) => (
          <CreatorRow
            key={creator.id}
            address={creator}
            onRemoveCreator={handleRemoveCreatorClick}
            isLoadingUsers={isLoadingUsers}
          />
        ))}
      </div>

      <Form schema={addCreatorSchema} handleSubmit={onAddCreator} className="add-creator">
        <Input name="address" type="text" className="text-input" placeholder="0xABC123..." />
        <button className="add-button" type="submit">
          Add
        </button>
      </Form>
    </div>
  );
}
