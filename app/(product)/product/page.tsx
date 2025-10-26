"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function ProductPage() {
  const { authenticated, user } = usePrivy();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Hello World!</h1>
      {authenticated && (
        <p className="text-lg text-gray-600">
          Welcome, {user?.wallet?.address || "User"}
        </p>
      )}
      <p className="text-sm text-gray-500 mt-4">
        This is the product page for authenticated users.
      </p>
    </div>
  );
}
