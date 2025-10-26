"use client";

import { usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;

    const isProductRoute = pathname === "/product";
    const isMarketingRoute = pathname === "/" || pathname.startsWith("/") && !isProductRoute;

    // Redirect authenticated users from marketing pages to product page
    if (authenticated && isMarketingRoute) {
      router.push("/product");
    }

    // Redirect unauthenticated users from product page to home
    if (!authenticated && isProductRoute) {
      router.push("/");
    }
  }, [ready, authenticated, pathname, router]);

  return <>{children}</>;
}
