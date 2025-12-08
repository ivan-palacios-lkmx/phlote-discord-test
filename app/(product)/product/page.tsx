"use client";

import PrivyUserDebug from "@/components/PrivyUserDebug";
import Button from "@/components/ui/Button";
import { useLogout, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function ProductPageContent() {
  const { authenticated, user } = usePrivy();
  const router = useRouter();
  const { logout } = useLogout({
    onSuccess: () => {
      router.push("/");
    },
  });
  const walletAddress = user?.wallet?.address || "";

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Hello World!</h1>

      <div className="w-full max-w-4xl mb-8">
        <PrivyUserDebug />
      </div>

      <p className="text-sm text-gray-500 mb-6">
        This is the product page for authenticated users.
      </p>

      <Button variant="primary" onClick={handleLogout}>
        Log out
      </Button>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={null}>
      <ProductPageContent />
    </Suspense>
  );
}
