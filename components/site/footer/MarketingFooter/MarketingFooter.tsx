"use client";

import { usePrismicio } from "@/components/PrismicioProvider";
import Woodmark from "@/components/icons/Woodmark";
import NewsletterForm from "@/components/site/footer/NewsletterForm/NewsletterForm";
import { PrismicRichText } from "@prismicio/react";
import { useMemo } from "react";

import "./MarketingFooter.scss";

export default function MarketingFooter(): JSX.Element {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const { settings } = usePrismicio();
  const footerCopy = settings.footer_copy;
  const socialMenu = settings.social_menu || [];
  const secondaryMenu = settings.secondary_menu || [];

  return (
    <footer className="site-marketing-footer">
      <Woodmark />

      {footerCopy ? (
        <div className="entry">
          <PrismicRichText field={footerCopy as never} />
        </div>
      ) : null}

      <NewsletterForm />

      <ul className="social-menu ul-reset">
        {socialMenu.map((item, index) => (
          <li key={index}>
            <a href={item.link as string}>{item.name || "Link"}</a>
          </li>
        ))}
      </ul>

      <div className="secondary-menu">
        <span>©PHLOTE {currentYear}</span>

        {secondaryMenu.length > 0 && (
          <ul className="ul-reset">
            {secondaryMenu.map((item, index) => (
              <li key={index}>
                <a href={item.link as string}>{item.name || "Link"}</a>
              </li>
            ))}
          </ul>
        )}

        <span className="desktop-only">©PHLOTE {currentYear}</span>
      </div>
    </footer>
  );
}
