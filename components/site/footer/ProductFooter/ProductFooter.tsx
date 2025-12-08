"use client";

import { usePrismicio } from "@/components/PrismicioProvider";
import Woodmark from "@/components/icons/Woodmark";
import NewsletterForm from "@/components/site/footer/NewsletterForm/NewsletterForm";
import ADiv from "@/components/slices/landing/Directory/ADiv/ADiv";

import "./ProductFooter.scss";

export default function ProductFooter() {
  const { settings } = usePrismicio();
  const currentYear = new Date().getFullYear();

  const socialMenu = settings.social_menu || [];

  return (
    <footer className="site-product-footer design-grid">
      <Woodmark />

      <NewsletterForm className="desktop-only" />

      <ul className="social-menu ul-reset desktop-only">
        {socialMenu.map((item, index) => (
          <li key={index}>
            <ADiv href={item.link}>{item.name || "Social Link"}</ADiv>
          </li>
        ))}
      </ul>

      <span className="copyright">©PHLOTE {currentYear}</span>
    </footer>
  );
}
