"use client";

import { usePrismicio } from "@/components/PrismicioProvider";
import Woodmark from "@/components/icons/Woodmark";
import ConnectWallet from "@/components/site/header/ConnectWallet/ConnectWallet";
import Logo from "@/components/svg/logo.svg";
import WordmarkSvg from "@/components/svg/}.svg";
import { useHeaderTranslate } from "@/hooks/useHeaderTranslate";
import { useLenis } from "@/hooks/useLenis";
import Link from "next/link";
import { physics, transform } from "popmotion";
import { useEffect, useMemo, useRef, useState } from "react";

import "./MarketingHeader.scss";

const { smooth } = transform;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logoPhysicsRef = useRef<any | null>(null);
  const headerTranslateRef = useRef(0);

  const headerTranslate = useHeaderTranslate();
  headerTranslateRef.current = headerTranslate;

  useEffect(() => {
    if (!lenis) return;

    const smoothTransform = smooth(100);

    logoPhysicsRef.current = physics({
      from: -0.00001,
      to: 0,
      springStrength: 20,
      velocity: 0,
      friction: 0.2,
      restSpeed: -1,
    })
      .pipe((v: number) => (headerTranslateRef.current === 0 ? v : 0), smoothTransform)
      .start((v: number) => {
        setLogoTranslate(v * -10);
      });

    const scrollHandler = (e: { animatedScroll: number; velocity: number }) => {
      setWordmarkTranslate(e.animatedScroll);
      if (logoPhysicsRef.current) {
        logoPhysicsRef.current.setAcceleration(e.velocity * 3);
      }
    };

    lenis.on("scroll", scrollHandler);

    return () => {
      lenis.off("scroll", scrollHandler);
      if (logoPhysicsRef.current) {
        logoPhysicsRef.current.stop();
      }
    };
  }, [lenis]);

  const wordmarkStyle = useMemo(
    () => ({ transform: `translateY(-${wordmarkTranslate}px)` }),
    [wordmarkTranslate],
  );

  const logoStyle = useMemo(
    () => ({ transform: `translateY(${logoTranslate}px)` }),
    [logoTranslate],
  );

  const headerStyle = useMemo(
    () => ({ transform: `translateY(-${headerTranslate}px)` }),
    [headerTranslate],
  );

  return (
    <header className="site-marketing-header" style={headerStyle}>
      <Link href="/" className="home-link">
        <Logo className="svg-logo" id="headerLogo" style={logoStyle} />
        <Woodmark className="svg-wordmark" style={wordmarkStyle} />
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
