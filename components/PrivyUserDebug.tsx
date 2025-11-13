"use client";

import { useSyncUser } from "@/hooks/query/query-hooks/use-sync-user";
import { useConnectWallet, usePrivy } from "@privy-io/react-auth";
import { useMemo, useState } from "react";

/**
 * Debug component to show what Privy user object contains
 */
export default function PrivyUserDebug() {
  const { user, ready, authenticated } = usePrivy();
  const { connectWallet } = useConnectWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  // Get first wallet address for syncing
  const walletAddress = useMemo(() => {
    if (!user || !authenticated) return null;
    const wallet = user.linkedAccounts?.find((acc: any) => acc.type === "wallet");
    return wallet && "address" in wallet ? (wallet.address as string) : null;
  }, [user, authenticated]);

  // Sync user address automatically
  const {
    isPending: isSyncing,
    isSuccess,
    isError,
  } = useSyncUser({
    address: walletAddress || "",
    enabled: !!walletAddress,
  });

  const syncStatus = useMemo(() => {
    if (isSyncing) return "Syncing...";
    if (isSuccess) return "Synced ✓";
    if (isError) return "Sync failed ✗";
    return "";
  }, [isSyncing, isSuccess, isError]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!ready) {
    return <div className="p-4 border rounded">Loading Privy...</div>;
  }

  if (!authenticated || !user) {
    return <div className="p-4 border rounded">Not authenticated</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Privy User Object Debug</h2>
        {(syncStatus || isSyncing) && (
          <span
            className={`text-sm px-3 py-1 rounded ${
              isSyncing || syncStatus.includes("Syncing")
                ? "bg-blue-100 text-blue-700"
                : syncStatus.includes("✓")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
            }`}>
            {isSyncing ? "Syncing..." : syncStatus}
          </span>
        )}
      </div>

      {/* User ID - This is UNIQUE for each user */}
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="font-bold text-blue-900">User ID (UNIQUE IDENTIFIER):</p>
        <p className="text-sm break-all">{user.id}</p>
        <p className="text-xs text-gray-600 mt-1">
          This is the unique Privy user ID. Use this to identify users in your database.
        </p>
      </div>

      {/* Linked Accounts */}
      <div className="mb-4 p-3 bg-green-50 rounded">
        <p className="font-bold text-green-900">Linked Accounts:</p>
        <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto">
          {JSON.stringify(user.linkedAccounts, null, 2)}
        </pre>
        <p className="text-xs text-gray-600 mt-2">
          All authentication methods (email, wallet, phone, OAuth) linked to this user
        </p>
      </div>

      {/* Email Account */}
      {user.linkedAccounts && (
        <div className="mb-4">
          <p className="font-bold">Email from Linked Accounts:</p>
          {user.linkedAccounts.find((acc: any) => acc.type === "email") ? (
            <div className="p-2 bg-white rounded text-sm">
              {(user.linkedAccounts.find((acc: any) => acc.type === "email") as any)?.address}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No email linked</p>
          )}
        </div>
      )}

      {/* Wallet Accounts */}
      {user.linkedAccounts && (
        <div className="mb-4">
          <p className="font-bold">Wallets from Linked Accounts:</p>
          {user.linkedAccounts.filter((acc: any) => acc.type === "wallet").length > 0 ? (
            user.linkedAccounts
              .filter((acc: any) => acc.type === "wallet")
              .map((wallet: any, i: number) => (
                <div key={i} className="p-2 bg-white rounded text-sm break-all">
                  {wallet.address}
                </div>
              ))
          ) : (
            <p className="text-sm text-gray-500">No wallets linked</p>
          )}
        </div>
      )}

      {/* Link Wallet Button */}
      {user.linkedAccounts &&
        user.linkedAccounts.filter((acc: any) => acc.type === "wallet").length === 0 && (
          <div className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="font-bold text-yellow-900 mb-2">No wallet linked yet</p>
            <p className="text-sm text-yellow-700 mb-3">
              Link a wallet to this account to enable wallet-based features.
            </p>
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isConnecting ? "Connecting..." : "Link Wallet"}
            </button>
          </div>
        )}

      {/* Raw User Object */}
      <details className="mt-4">
        <summary className="cursor-pointer font-bold text-gray-700">
          View Full Privy User Object
        </summary>
        <pre className="mt-2 text-xs bg-white p-3 rounded overflow-auto max-h-96">
          {JSON.stringify(user, null, 2)}
        </pre>
      </details>
    </div>
  );
}
