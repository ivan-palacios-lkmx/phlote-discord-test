"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

/**
 * Component to demonstrate linking a wallet to an email account
 *
 * How it works:
 * 1. User logs in with email → Privy creates a user with email linked
 * 2. User's PrivyUser object shows their linked accounts
 * 3. When user connects a wallet, Privy automatically links it to the same user ID
 */
export default function LinkWalletButton() {
  const { user, ready, authenticated } = usePrivy();
  const [walletAddress, setWalletAddress] = useState<string>("");

  if (!ready || !authenticated || !user) {
    return null;
  }

  // Get all linked accounts (email, wallet, phone, etc.)
  const linkedAccounts = user.linkedAccounts || [];

  // Get email account
  const emailAccount = linkedAccounts.find((account) => account.type === "email");

  // Get wallet account(s)
  const walletAccounts = linkedAccounts.filter((account) => account.type === "wallet");

  const handleLinkWallet = async () => {
    // When user connects a wallet via Privy, it's automatically linked
    // You don't need to manually link it - Privy does this automatically

    if (walletAccounts.length > 0) {
      alert(`Wallet already linked: ${walletAccounts[0].address}`);
      setWalletAddress(walletAccounts[0].address || "");
    } else {
      alert("Connect your wallet through Privy's wallet connection flow");
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-2">Account Linking Info</h3>

      <div className="mb-2">
        <p>
          <strong>Email:</strong>{" "}
          {emailAccount?.type === "email" ? emailAccount.address : "Not found"}
        </p>
      </div>

      <div className="mb-2">
        <p>
          <strong>Wallets Linked:</strong> {walletAccounts.length}
        </p>
        {walletAccounts.map((wallet, index) => (
          <p key={index} className="text-sm text-gray-600">
            {wallet.address}
          </p>
        ))}
      </div>

      <button onClick={handleLinkWallet} className="px-4 py-2 bg-blue-500 text-white rounded">
        {walletAccounts.length > 0 ? "Wallet Already Linked" : "Connect Wallet"}
      </button>
    </div>
  );
}
