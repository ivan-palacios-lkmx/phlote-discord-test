import WoodmarkIcon from "@/components/icons/Woodmark";
import ConnectWallet from "@/components/site/header/ConnectWallet/ConnectWallet";
import Link from "next/link";

import "./Header.scss";

export default function AdminHeader() {
  return (
    <header className="admin-header">
      <Link href="/" className="home-link">
        <WoodmarkIcon />
      </Link>
      <nav>
        <ConnectWallet />
      </nav>
    </header>
  );
}
