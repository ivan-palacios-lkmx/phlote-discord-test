"use client";

import WordmarkSvg from "@/components/svg/woodmark.svg";

// MIGRATED: Placeholder components for unknown elements
function NewsletterForm() {
  return (
    <div className="newsletter-form">
      {/* MIGRATED: Placeholder for newsletter-form - replace with actual newsletter component */}
      <div className="bg-white/10 rounded p-4 text-center">
        <p className="text-sm text-white/70">Newsletter Form Placeholder</p>
      </div>
    </div>
  );
}

interface ProductFooterProps {
  settings: {
    social_menu?: Array<{ name?: string; link?: string }>;
  };
}

export default function ProductFooter({ settings }: ProductFooterProps) {
  // MIGRATED: currentYear computed property
  const currentYear = new Date().getFullYear();

  const socialMenu = settings.social_menu || [];

  return (
    <footer className="site-product-footer grid grid-cols-12 gap-5 px-4 bg-black text-white pt-4 pb-4 items-center border-t border-white/35 relative z-10">
      {/* MIGRATED: svg-wordmark section */}
      <WordmarkSvg className="w-[84px] h-auto" />

      {/* MIGRATED: newsletter-form section - Desktop Only */}
      <div className="newsletter-form desktop-only col-start-3 col-span-3 hidden md:block">
        <NewsletterForm />
      </div>

      {/* MIGRATED: social-menu section - Desktop Only */}
      <ul className="social-menu desktop-only col-start-7 col-span-5 gap-8 hidden md:flex">
        {socialMenu.map((item, index) => (
          <li key={index}>
            <a
              href={item.link || "#"}
              className="text-lg font-condensed leading-[90%] hover:text-white/70 transition-colors"
            >
              {item.name || "Social Link"}
            </a>
          </li>
        ))}
      </ul>

      {/* MIGRATED: copyright section */}
      <span className="copyright col-start-12 text-sm text-white/70">
        ©PHLOTE {currentYear}
      </span>
    </footer>
  );
}
