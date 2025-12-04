"use client";

import { usePrismicio } from "@/components/PrismicioProvider";
import HamburgerIcon from "@/components/icons/HamburgerIcon/HamburgerIcon";
import Logo from "@/components/icons/Logo";
import WoodmarkIcon from "@/components/icons/Woodmark";
import ConnectWallet from "@/components/site/header/ConnectWallet/ConnectWallet";
import { useHeaderTranslate } from "@/hooks/useHeaderTranslate";
import { useLenis } from "@/hooks/useLenis";
import { useMenuOpen } from "@/hooks/useMenuOpen";
import Link from "next/link";
import { physics, transform } from "popmotion";
import { useEffect, useMemo, useRef, useState } from "react";

import "./MarketingHeader.scss";

const { smooth } = transform;

export default function MarketingHeader() {
  const { settings } = usePrismicio();
  const mainMenu = settings.main_menu || [];
  const lenisRef = useLenis();
  const lenis = lenisRef?.current;
  const { menuOpen, setMenuOpen } = useMenuOpen();

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
    const MAX_VELOCITY = 25;
    const VELOCITY_MULTIPLIER = 6;

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
        const clampedVelocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, e.velocity));
        logoPhysicsRef.current.setAcceleration(clampedVelocity * VELOCITY_MULTIPLIER);
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
        <WoodmarkIcon className="svg-wordmark" style={wordmarkStyle} />
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
        <HamburgerIcon active={menuOpen} onToggle={setMenuOpen} />
      </div>
    </header>
  );
}
