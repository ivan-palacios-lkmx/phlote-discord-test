interface FilterButtonProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function FilterButton({
  children,
  active,
  onClick,
  className = "",
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] border transition-colors ${
        active ? "border-white/50 bg-white/10" : "border-white/30"
      } ${className}`}>
      {children}
      {/* Placeholder for close icon */}
      {active && <span className="text-[10px]">×</span>}
    </button>
  );
}
