"use client";

import { usePrismicio } from "@/components/PrismicioProvider";
import Logo from "@/components/svg/logo.svg";
import WordmarkSvg from "@/components/svg/woodmark.svg";
import { useLenis } from "@/hooks/useLenis";
import ConnectWallet from "@/components/site/header/ConnectWallet/ConnectWallet";
import Link from "next/link";
import { animate, smooth } from "popmotion";
import { useEffect, useRef, useState } from "react";

import "./MarketingHeader.scss";

function HamburgerIcon() {
  return (
    <button className="flex flex-col gap-1 p-2">
      <div className="h-0.5 w-6 bg-white"></div>
      <div className="h-0.5 w-6 bg-white"></div>
      <div className="h-0.5 w-6 bg-white"></div>
    </button>
  );
}

export default function MarketingHeader() {
  const { settings } = usePrismicio();
  const mainMenu = settings.main_menu || [];
  const lenisRef = useLenis();
  const lenis = lenisRef?.current;

  const [wordmarkTranslate, setWordmarkTranslate] = useState(0);
  const [logoTranslate, setLogoTranslate] = useState(0);
  const logoAnimationRef = useRef<{ stop: () => void } | null>(null);
  const currentValueRef = useRef(-0.00001);

  useEffect(() => {
    if (!lenis) return;

    const headerTranslate = 0; // TODO: implement useHeaderTranslate if needed
    const smoothTransform = smooth(100);

    const startLogoAnimation = () => {
      if (logoAnimationRef.current) {
        logoAnimationRef.current.stop();
      }

      logoAnimationRef.current = animate({
        from: currentValueRef.current,
        to: 0,
        type: "spring",
        stiffness: 20,
        damping: 0.2,
        restSpeed: 0.01,
        restDelta: 0.01,
        onUpdate: (v: number) => {
          currentValueRef.current = v;
          const smoothedValue = headerTranslate === 0 ? smoothTransform(v) : 0;
          setLogoTranslate(smoothedValue * -10);
        },
      });
    };

    startLogoAnimation();

    const scrollHandler = (e: { animatedScroll: number; velocity: number }) => {
      setWordmarkTranslate(e.animatedScroll);
      // Apply velocity as acceleration by restarting animation with new velocity
      if (logoAnimationRef.current) {
        logoAnimationRef.current.stop();
        logoAnimationRef.current = animate({
          from: currentValueRef.current,
          to: 0,
          type: "spring",
          stiffness: 20,
          damping: 0.2,
          restSpeed: 0.01,
          restDelta: 0.01,
          velocity: e.velocity * 3,
          onUpdate: (v: number) => {
            currentValueRef.current = v;
            const smoothedValue = headerTranslate === 0 ? smoothTransform(v) : 0;
            setLogoTranslate(smoothedValue * -10);
          },
        });
      }
    };

    lenis.on("scroll", scrollHandler);

    return () => {
      lenis.off("scroll", scrollHandler);
      if (logoAnimationRef.current) {
        logoAnimationRef.current.stop();
      }
    };
  }, [lenis]);

  const wordmarkStyle = {
    transform: `translateY(-${wordmarkTranslate}px)`,
  };

  const logoStyle = {
    transform: `translateY(${logoTranslate}px)`,
  };

  return (
    <header className="site-marketing-header">
      <Link href="/" className="home-link">
        <Logo className="svg-logo" id="headerLogo" style={logoStyle} />
        <WordmarkSvg className="svg-wordmark" style={wordmarkStyle} />
      </Link>

      <p className="home-copy desktop-only">{settings.home_copy}</p>

      <nav className="desktop-only">
        {mainMenu.map((item, index) => (
          <a key={index} href={item.link as string} className="a-div mono">
            {item.name || "Link"}
          </a>
        ))}
        <ConnectWallet />
      </nav>

      <div className="mobile-only nav">
        <ConnectWallet />
        <HamburgerIcon />
      </div>
    </header>
  );
}
