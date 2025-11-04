interface CopyButtonProps {
  copyText: string;
  children: React.ReactNode;
}

export default function CopyButton({ copyText, children }: CopyButtonProps) {
  // TODO: Implement CopyButton component
  // This should copy text to clipboard when clicked
  const handleClick = () => {
    // TODO: Implement copy functionality
    navigator.clipboard.writeText(copyText);
  };

  return (
    <button onClick={handleClick} className="font-mono underline uppercase">
      {children}
    </button>
  );
}
