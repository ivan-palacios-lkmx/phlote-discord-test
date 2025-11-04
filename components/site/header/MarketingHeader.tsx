"use client";

import { usePrismicio } from "@/components/PrismicioProvider";
import Logo from "@/components/svg/logo.svg";
import WordmarkSvg from "@/components/svg/woodmark.svg";
import Button from "@/components/ui/Button";
import { useLenis } from "@/hooks/useLenis";
import { useLogin } from "@privy-io/react-auth";
import Link from "next/link";
import { animate, smooth } from "popmotion";
import { useEffect, useRef, useState } from "react";

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
  const { login } = useLogin();
  const lenisRef = useLenis();
  const lenis = lenisRef?.current;

  const [wordmarkTranslate, setWordmarkTranslate] = useState(0);
  const [logoTranslate, setLogoTranslate] = useState(0);
  const logoAnimation = useRef<{ stop: () => void } | null>(null);
  const currentValueRef = useRef(-0.00001);

  useEffect(() => {
    if (!lenis) return;

    const smoothTransform = smooth(50);
    logoAnimation.current = animate({
      from: 0,
      to: 0,
      type: "spring",
      stiffness: 2,
      damping: 1,
      mass: 0.5,
      restSpeed: 0.01,
      restDelta: 0.01,
      onUpdate: (v: number) => {
        currentValueRef.current = v;
        const smoothedValue = smoothTransform(v);
        setLogoTranslate(smoothedValue * -5);
      },
    });

    const scrollHandler = (e: { animatedScroll: number; velocity: number }) => {
      setWordmarkTranslate(e.animatedScroll);
      if (logoAnimation.current) {
        logoAnimation.current.stop();
        logoAnimation.current = animate({
          from: currentValueRef.current,
          to: 0,
          type: "spring",
          stiffness: 20,
          damping: 0.95,
          mass: 1,
          restSpeed: 0.01,
          restDelta: 0.01,
          velocity: e.velocity * 1.5,
          onUpdate: (v: number) => {
            currentValueRef.current = v;
            const smoothedValue = smoothTransform(v);
            setLogoTranslate(smoothedValue * -5);
          },
        });
      }
    };

    lenis.on("scroll", scrollHandler);

    return () => {
      lenis.off("scroll", scrollHandler);
      if (logoAnimation.current) {
        logoAnimation.current.stop();
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
    <header className="fixed right-0 left-0 top-0 z-10 p-9 grid gap-5 md:flex md:justify-between md:p-4">
      <Link href="/" className="relative">
        <Logo className="h-auto absolute -z-10 left-5 top-0" style={logoStyle} />
        <WordmarkSvg className="text-white stroke-black h-auto ml-20" style={wordmarkStyle} />
      </Link>
      <p className="home-copy desktop-only max-w-[600px] text-center text-white m-0 hidden md:block text-[12px]">
        {settings.home_copy}
      </p>

      <nav className="desktop-only col-start-3 flex justify-end items-start gap-2.5 flex-nowrap md:col-auto">
        {mainMenu.map((item, index) => (
          <Link
            key={index}
            href={item.link || "#"}
            className="whitespace-nowrap pointer-events-auto">
            <Button variant="outline">{item.name || "Link"}</Button>
          </Link>
        ))}
        <Button variant="outline" onClick={login}>
          Connect
        </Button>
      </nav>

      <div className="mobile-only nav md:hidden flex items-center gap-2.5">
        <Button variant="outline">Connect Wallet</Button>
        <HamburgerIcon />
      </div>
    </header>
  );
}
