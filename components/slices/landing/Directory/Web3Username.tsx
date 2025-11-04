interface Web3UsernameProps {
  address: string;
}

export default function Web3Username({ address }: Web3UsernameProps) {
  // TODO: Implement Web3Username component
  // This should display a username based on the wallet address
  return (
    <span className="web3-username whitespace-nowrap text-ellipsis overflow-hidden pt-[2px]">
      {/* Placeholder for username implementation */}
      {address.slice(0, 6)}...{address.slice(-4)}
    </span>
  );
}
