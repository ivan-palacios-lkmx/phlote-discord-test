interface SocialMenuProps {
  socialMenu: Array<{ name?: string; link?: unknown }>;
}

export default function SocialMenu({ socialMenu }: SocialMenuProps): JSX.Element | null {
  if (socialMenu.length === 0) {
    return null;
  }

  return (
    <ul className="social-menu flex items-center gap-10 py-15 md:gap-4 md:py-10">
      {socialMenu.map((item, index) => (
        <li key={index}>
          <a
            href={item.link as string}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-normal leading-[90%] transition-colors hover:text-white/70 md:text-sm uppercase">
            {item.name || "Link"}
          </a>
        </li>
      ))}
    </ul>
  );
}
