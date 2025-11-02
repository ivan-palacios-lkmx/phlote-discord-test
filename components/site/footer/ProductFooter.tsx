"use client";

import WordmarkSvg from "@/components/svg/woodmark.svg";
import { usePrismicio } from "@/components/PrismicioProvider";

function NewsletterForm() {
  return (
    <div className="newsletter-form">
      <div className="bg-white/10 rounded p-4 text-center">
        <p className="text-sm text-white/70">Newsletter Form Placeholder</p>
      </div>
    </div>
  );
}

export default function ProductFooter() {
  const { settings } = usePrismicio();
  const currentYear = new Date().getFullYear();

  const socialMenu = settings.social_menu || [];

  return (
    <footer className="site-product-footer grid grid-cols-12 gap-5 px-4 bg-black text-white pt-4 pb-4 items-center border-t border-white/35 relative z-10">
      <WordmarkSvg className="w-[84px] h-auto" />

      <div className="newsletter-form desktop-only col-start-3 col-span-3 hidden md:block">
        <NewsletterForm />
      </div>

      <ul className="social-menu desktop-only col-start-7 col-span-5 gap-8 hidden md:flex">
        {socialMenu.map((item, index) => (
          <li key={index}>
            <a
              href={item.link || "#"}
              className="text-lg font-condensed leading-[90%] hover:text-white/70 transition-colors">
              {item.name || "Social Link"}
            </a>
          </li>
        ))}
      </ul>

      <span className="copyright col-start-12 text-sm text-white/70">©PHLOTE {currentYear}</span>
    </footer>
  );
}
