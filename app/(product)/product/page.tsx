"use client";

import PrivyUserDebug from "@/components/PrivyUserDebug";
import Button from "@/components/ui/Button";
import { useGetAccount } from "@/hooks/query/query-hooks/useAccount";
import { useLogout, usePrivy } from "@privy-io/react-auth";

export default function ProductPage() {
  const { authenticated, user } = usePrivy();
  const { logout } = useLogout();
  const walletAddress = user?.wallet?.address || "";

  const { data: accountInfo, isLoading, error } = useGetAccount({
    address: walletAddress,
    enabled: authenticated && !!walletAddress,
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Hello World!</h1>

      <div className="w-full max-w-4xl mb-8">
        <PrivyUserDebug />
      </div>

      {authenticated && (
        <>
          <p className="text-lg text-gray-600 mb-2">
            Welcome, {user?.wallet?.address || "User"}
          </p>

          {isLoading && (
            <p className="text-sm text-gray-500 mb-4">Loading account info...</p>
          )}

          {error && (
            <p className="text-sm text-red-500 mb-4">
              Error loading account info
            </p>
          )}

          {accountInfo && (
            <div className="text-sm text-gray-600 mb-4">
              <p>
                Status:{" "}
                <span className="font-bold">
                  {accountInfo.data?.role || "User"}
                </span>
              </p>
            </div>
          )}
        </>
      )}

      <p className="text-sm text-gray-500 mb-6">
        This is the product page for authenticated users.
      </p>

      <Button variant="primary" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}
