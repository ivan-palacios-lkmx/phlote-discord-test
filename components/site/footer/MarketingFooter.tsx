"use client";

import SvgWordmark from "@/components/svg/woodmark.svg";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { useMemo } from "react";

import NewsletterForm from "./NewsletterForm";

// SVG Wordmark component (placeholder)

export default function MarketingFooter({ slice }: SliceComponentProps): JSX.Element {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Get settings data from slice
  const settings =
    (
      slice as unknown as {
        primary?: {
          footer_copy?: unknown;
          social_menu?: Array<{ name?: string; link?: unknown }>;
          secondary_menu?: Array<{ name?: string; link?: unknown }>;
        };
      }
    ).primary || {};

  const footerCopy = settings.footer_copy;
  const socialMenu = settings.social_menu || [];
  const secondaryMenu = settings.secondary_menu || [];

  return (
    <footer className="site-marketing-footer flex flex-col items-center bg-black px-4 pt-[100px] text-white">
      {/* Logo */}
      <SvgWordmark />

      {/* Footer copy */}
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

      {/* Newsletter form */}
      <NewsletterForm />

      {/* Social menu */}
      {socialMenu.length > 0 && (
        <ul className="social-menu flex items-center gap-10 py-15 md:gap-4 md:py-10">
          {socialMenu.map((item, index) => (
            <li key={index}>
              <a
                href={item.link as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium leading-[90%] transition-colors hover:text-white/70 md:text-sm">
                {item.name || "Link"}
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Secondary menu */}
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
