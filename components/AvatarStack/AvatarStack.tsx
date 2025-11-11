"use client";

import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { reverse } from "lodash";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import "./AvatarStack.scss";

interface AvatarStackProps {
  addresses?: string[];
  isLink?: boolean;
}

export default function AvatarStack({ addresses = [], isLink = false }: AvatarStackProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const wallets = useMemo(() => {
    return reverse([...(addresses || [])].slice(0, 10));
  }, [addresses]);

  const linkTo = (address: string) => {
    const current = new URLSearchParams(searchParams.toString());
    current.set("profile", address);
    return {
      pathname: pathname || "/",
      query: Object.fromEntries(current.entries()),
    };
  };

  if (!wallets.length) {
    return null;
  }

  return (
    <div className={`avatar-stack ${isLink ? "is-link" : ""}`}>
      {wallets.map((address) => {
        const avatar = <Web3Avatar className="avatar-img" address={address} />;

        if (isLink) {
          return (
            <Link key={`link-${address}`} href={linkTo(address)} className="avatar-link">
              {avatar}
            </Link>
          );
        }

        return (
          <div key={`div-${address}`} className="avatar-link">
            {avatar}
          </div>
        );
      })}
    </div>
  );
}
