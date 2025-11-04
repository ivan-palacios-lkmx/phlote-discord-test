interface BadgeProps {
  text: string;
}

export default function Badge({ text }: BadgeProps) {
  return (
    <div className="bg-transparent border border-white rounded-lg px-4 py-2">
      <span className="text-white text-sm uppercase">{text}</span>
    </div>
  );
}
