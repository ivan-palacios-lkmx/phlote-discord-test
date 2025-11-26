"use client";

import Web3Avatar from "@/components/web3/Web3Avatar/Web3Avatar";
import { useGetMultipleAddressInfo } from "@/hooks/query/query-hooks/use-get-multiple-address-info";
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
    const filtered = (addresses || []).filter((addr) => addr && addr.trim() !== "");
    return reverse([...filtered].slice(0, 10));
  }, [addresses]);

  const addressQueries = useGetMultipleAddressInfo({
    addresses: wallets,
    includePrivate: false,
    enabled: wallets.length > 0,
  });

  const addressMap = useMemo(() => {
    const map = new Map<string, string>();
    wallets.forEach((address, index) => {
      const query = addressQueries[index];
      if (query) {
        const avatar = query.data?.avatar || "/images/phlote-poster.jpg";
        map.set(address, avatar);
      } else {
        map.set(address, "/images/phlote-poster.jpg");
      }
    });
    return map;
  }, [wallets, addressQueries]);

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
        const avatarUrl = addressMap.get(address) || "/images/phlote-poster.jpg";
        const avatar = (
          <Web3Avatar key={`avatar-${address}`} className="avatar-img" avatar={avatarUrl} />
        );

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
