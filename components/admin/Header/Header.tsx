import ConnectWallet from "@/components/site/header/ConnectWallet/ConnectWallet";
import WordmarkSvg from "@/components/svg/woodmark.svg";
import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="admin-header">
      <Link href="/" className="home-link">
        <WordmarkSvg />
      </Link>
      <nav>
        <ConnectWallet />
      </nav>
    </header>
  );
}
