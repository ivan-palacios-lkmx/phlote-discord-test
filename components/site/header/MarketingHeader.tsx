"use client";

import Link from "next/link";
import WordmarkSvg from "@/components/svg/woodmark.svg";
import Button from "@/components/ui/Button";

// MIGRATED: Placeholder components for unknown elements
function SvgLogo() {
  return (
    <div className="w-40 h-auto absolute -z-10 left-5 top-0 md:w-15">
      {/* MIGRATED: Placeholder for svg-logo - replace with actual SVG component */}
      <div className="w-full h-20 bg-white/20 rounded md:h-15"></div>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <button className="flex flex-col gap-1 p-2">
      {/* MIGRATED: Placeholder for hamburger-icon - replace with actual icon component */}
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

  return (
    <header className="site-marketing-header fixed right-0 left-0 top-0 z-10 p-9 px-4 grid grid-cols-[1fr_auto_1fr] gap-5 pointer-events-none md:flex md:justify-between md:p-4">
      {/* MIGRATED: responsive design - grid layout for desktop, flex for mobile */}
      {/* MIGRATED: Home Link section with logo and wordmark */}
      <Link href="/" className="home-link pointer-events-auto">
        <SvgLogo />
        <WordmarkSvg className="text-white stroke-black w-[150px] h-auto ml-20 md:w-15 md:ml-9" />
      </Link>

      {/* MIGRATED: home-copy section - Desktop Only */}
      <p className="home-copy desktop-only max-w-[600px] text-center text-white m-0 hidden md:block">
        {settings.home_copy}
      </p>

      {/* MIGRATED: desktop-only navbar section */}
      <nav className="desktop-only col-start-3 flex justify-end items-start gap-2.5 flex-nowrap md:col-auto pointer-events-auto">
        {mainMenu.map((item, index) => (
          <Link key={index} href={item.link || "#"} className="whitespace-nowrap">
            <Button variant="outline">
              {item.name || "Link"}
            </Button>
          </Link>
        ))}
        <Button variant="outline">
          Connect Wallet
        </Button>
      </nav>

      {/* MIGRATED: mobile-only navigation section */}
      <div className="mobile-only nav md:hidden flex items-center gap-2.5 pointer-events-auto">
        <Button variant="outline">
          Connect Wallet
        </Button>
        <HamburgerIcon />
      </div>
    </header>
  );
}
