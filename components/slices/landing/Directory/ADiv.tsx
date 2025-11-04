interface ADivProps {
  href: string;
  children: React.ReactNode;
}

export default function ADiv({ href, children }: ADivProps) {
  // TODO: Implement ADiv component
  // This should be a link component (similar to <a> tag)
  return (
    <a href={href} className="font-mono underline uppercase">
      {children}
    </a>
  );
}
