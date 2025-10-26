"use client";

import Button from "@/components/ui/Button";
import { useLogout, usePrivy } from "@privy-io/react-auth";

export default function ProductPage() {
  const { authenticated, user } = usePrivy();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Hello World!</h1>
      {authenticated && (
        <p className="text-lg text-gray-600 mb-4">
          Welcome, {user?.wallet?.address || "User"}
        </p>
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
