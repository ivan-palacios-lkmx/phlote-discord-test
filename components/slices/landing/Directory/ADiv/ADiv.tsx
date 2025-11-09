"use client";

import Link from "next/link";
import { useMemo } from "react";

import "./ADiv.scss";

interface ADivProps {
  href?: string | boolean;
  replaceWith?: keyof JSX.IntrinsicElements;
  noNewTab?: boolean;
  children: React.ReactNode;
  className?: string;
}

const isRelativeLink = new RegExp("^(?:[a-z]+:)?//", "i");

export default function ADiv({
  href,
  replaceWith = "div",
  noNewTab = false,
  children,
  className = "",
}: ADivProps) {
  const isAbsolute = useMemo(() => {
    if (!href || typeof href !== "string") return false;
    // tel or mailto
    if (noNewTab || /^mailto:|^tel:/.test(href)) return true;
    // other links
    return isRelativeLink.test(href);
  }, [href, noNewTab]);

  const isAnchor = useMemo(() => {
    if (!href || typeof href !== "string") return false;
    return href.startsWith("#");
  }, [href]);

  const hrefString = typeof href === "string" ? href : "";

  if (isAbsolute) {
    return (
      <a
        className={`a-div has-link ${isAbsolute ? "isAbsolute" : ""} ${className}`.trim()}
        href={hrefString}
        target={isAbsolute ? "_blank" : "_self"}>
        {children}
      </a>
    );
  }

  if (isAnchor) {
    return (
      <a className={`a-div ${className}`.trim()} href={hrefString}>
        {children}
      </a>
    );
  }

  if (hrefString) {
    return (
      <Link href={hrefString} className={`a-div has-link ${className}`.trim()}>
        {children}
      </Link>
    );
  }

  const Component = replaceWith;
  return (
    <Component className={`a-div ${className}`.trim()}>
      {children}
    </Component>
  );
}
