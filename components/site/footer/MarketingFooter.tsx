"use client";

import { usePrismicio } from "@/components/PrismicioProvider";
import SvgWordmark from "@/components/svg/woodmark.svg";
import { PrismicRichText } from "@prismicio/react";
import { useMemo } from "react";

import NewsletterForm from "./NewsletterForm";
import SocialMenu from "./SocialMenu";

export default function MarketingFooter(): JSX.Element {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const { settings } = usePrismicio();
  const footerCopy = settings.footer_copy;
  const socialMenu = settings.social_menu || [];
  const secondaryMenu = settings.secondary_menu || [];

  return (
    <footer className="site-marketing-footer flex flex-col items-center bg-black px-4 pt-[100px] text-white">
      <SvgWordmark />

      {footerCopy ? (
        <div className="entry mt-10 max-w-[600px] text-center">
          <PrismicRichText
            field={footerCopy as never}
            components={{
              paragraph: ({ children }) => <p className="text-base leading-relaxed">{children}</p>,
            }}
          />
        </div>
      ) : null}

      <NewsletterForm />

      <SocialMenu socialMenu={socialMenu} />

      <div className="secondary-menu flex w-full items-center justify-between gap-8 pb-16">
        <span className="flex-1 text-sm">©PHLOTE {currentYear}</span>

        {secondaryMenu.length > 0 && (
          <ul className="flex items-center gap-6">
            {secondaryMenu.map((item, index) => (
              <li key={index}>
                <a
                  href={item.link as string}
                  className="text-sm transition-colors hover:text-white/70">
                  {item.name || "Link"}
                </a>
              </li>
            ))}
          </ul>
        )}

        <span className="hidden text-sm md:block">©PHLOTE {currentYear}</span>
      </div>
    </footer>
  );
}
