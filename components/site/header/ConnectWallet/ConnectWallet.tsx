"use client";

import ProfileIcon from "@/components/svg/profile.svg";
import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import Web3Username from "@/components/web3/Web3Username/Web3Username";
import { useFirebaseAuthWithPrivy } from "@/hooks/useFirebaseAuthWithPrivy";
import { useWeb3Identity } from "@/hooks/useWeb3Identity";
import { UPDATE_THRESHOLD_IN_MS } from "@/utils/constants";
import { User, useLogin, usePrivy } from "@privy-io/react-auth";
import { setDoc } from "firebase/firestore";
import { useEffect, useMemo } from "react";

import "./ConnectWallet.scss";

export default function ConnectWallet() {
  const { login } = useLogin();
  const { user, authenticated } = usePrivy();
  const { isAuthenticating, error: authError } = useFirebaseAuthWithPrivy();

  function findWallet(user: User) {
    return user.linkedAccounts?.find((acc) => acc.type === "wallet");
  }
  const connectedAddress = useMemo(() => {
    if (!user || !authenticated) return null;
    const wallet = findWallet(user);
    return wallet && "address" in wallet ? (wallet.address as string) : null;
  }, [user, authenticated]);

  const { addressDoc, addressDocRef } = useWeb3Identity(connectedAddress);

  // TODO: Check if addressDocRef is really necessary
  const canUpdate = useMemo(() => {
    if (addressDoc == null || addressDocRef == null) return false;
    const addressLastUpdate = addressDoc.updated?.toDate();
    if (!addressLastUpdate) return false;
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - addressLastUpdate.getTime();
    return timeSinceLastUpdate > UPDATE_THRESHOLD_IN_MS;
  }, [addressDoc, addressDocRef]);

  useEffect(() => {
    async function updateAddressDoc() {
      if (canUpdate && addressDocRef) {
        await setDoc(
          addressDocRef,
          {
            shouldUpdate: true,
          },
          { merge: true },
        );
      }
    }
    updateAddressDoc();
  }, [canUpdate, addressDocRef]);

  return (
    <button
      onClick={login}
      className="connect-wallet mono"
      key={connectedAddress || "not-connected"}>
      <div className="border" />
      <div className="img-wrap">
        {connectedAddress ? <Web3Avatar address={connectedAddress} /> : <ProfileIcon />}
      </div>
      {connectedAddress ? <Web3Username address={connectedAddress} /> : <span>Connect</span>}
    </button>
  );
}
