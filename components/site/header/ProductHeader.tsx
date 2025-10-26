"use client";

import WordmarkSvg from "@/components/svg/woodmark.svg";
import Link from "next/link";

// Connect Wallet component (placeholder)
function ConnectWallet() {
  return (
    <button className="mono rounded-[60px] border border-white/20 bg-black/20 px-4 py-2 font-mono uppercase backdrop-blur-md transition-colors hover:bg-white hover:text-black">
      Connect Wallet
    </button>
  );
}

interface ProductHeaderProps {
  settings: {
    app_menu?: Array<{ name?: string; link?: string }>;
  };
}

export default function ProductHeader({ settings }: ProductHeaderProps) {
  const appMenu = settings.app_menu || [];

  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-10 grid grid-cols-[1fr_auto_1fr] gap-5 px-4 py-9 md:items-center md:px-4 md:py-4">
      {/* Home Link */}
      <Link href="/" className="mr-auto pointer-events-auto">
        <WordmarkSvg className="h-auto text-white" />
      </Link>

      {/* Navigation */}
      <nav className="col-start-3 flex flex-nowrap items-start justify-end gap-2.5 pointer-events-auto">
        {appMenu.map((item, index) => (
          <Link
            key={index}
            href={item.link || "#"}
            className="mono whitespace-nowrap rounded-[60px] border border-white/20 bg-black/20 px-4 py-2 font-mono uppercase backdrop-blur-md transition-colors hover:bg-white hover:text-black">
            {item.name || "Link"}
          </Link>
        ))}

        <ConnectWallet />
      </nav>
    </header>
  );
}
