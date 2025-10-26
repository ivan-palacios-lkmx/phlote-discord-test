"use client";

import Logo from "@/components/svg/logo.svg";
import WordmarkSvg from "@/components/svg/woodmark.svg";
import Button from "@/components/ui/Button";
import { useLogin } from "@privy-io/react-auth";
import Link from "next/link";

function HamburgerIcon() {
  return (
    <button className="flex flex-col gap-1 p-2">
      <div className="h-0.5 w-6 bg-white"></div>
      <div className="h-0.5 w-6 bg-white"></div>
      <div className="h-0.5 w-6 bg-white"></div>
    </button>
  );
}

interface MarketingHeaderProps {
  settings: {
    home_copy?: string;
    main_menu?: Array<{ name?: string; link?: string }>;
  };
}

export default function MarketingHeader({ settings }: MarketingHeaderProps) {
  const mainMenu = settings.main_menu || [];
  const { login } = useLogin();
  return (
    <header className="fixed right-0 left-0 top-0 z-10 p-9 grid gap-5 pointer-events-none md:flex md:justify-between md:p-4">
      <Link href="/" className="pointer-events-auto relative">
        <Logo className="h-auto absolute -z-10 left-5 top-0" />
        <WordmarkSvg className="text-white stroke-black h-auto ml-20" />
      </Link>

      <p className="home-copy desktop-only max-w-[600px] text-center text-white m-0 hidden md:block">
        {settings.home_copy}
      </p>

      <nav className="desktop-only col-start-3 flex justify-end items-start gap-2.5 flex-nowrap md:col-auto pointer-events-auto">
        {mainMenu.map((item, index) => (
          <Link key={index} href={item.link || "#"} className="whitespace-nowrap">
            <Button variant="outline">{item.name || "Link"}</Button>
          </Link>
        ))}
        <Button variant="outline" onClick={login}>
          Connect
        </Button>
      </nav>

      <div className="mobile-only nav md:hidden flex items-center gap-2.5 pointer-events-auto">
        <Button variant="outline">Connect Wallet</Button>
        <HamburgerIcon />
      </div>
    </header>
  );
}
