"use client";

import { usePrismicio } from "@/components/PrismicioProvider";
import ConnectWallet from "@/components/site/header/ConnectWallet/ConnectWallet";
import ADiv from "@/components/slices/landing/Directory/ADiv/ADiv";
import WordmarkSvg from "@/components/svg/woodmark.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";

import "./ProductHeader.scss";

export default function ProductHeader() {
  const { settings } = usePrismicio();
  const appMenu = settings.app_menu || [];
  const pathname = usePathname();

  return (
    <header className="site-product-header">
      <Link href="/" className="home-link">
        <WordmarkSvg />
      </Link>

      <nav>
        {appMenu.map((item, index) => (
          <ADiv
            key={index}
            href={item.link || "#"}
            className={`mono ${pathname === item.link ? "router-link-exact-active" : ""}`}>
            {item.name || "Link"}
          </ADiv>
        ))}

        <ConnectWallet />
      </nav>
    </header>
  );
}
