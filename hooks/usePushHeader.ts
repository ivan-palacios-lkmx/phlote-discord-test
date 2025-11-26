"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useSetHeaderTranslate } from "./useHeaderTranslate";

interface ElementBounding {
  y: number;
  height: number;
}

function useElementBounding(elementRef: React.RefObject<HTMLElement>): ElementBounding {
  const [bounding, setBounding] = useState<ElementBounding>({ y: 0, height: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const updateBounding = () => {
      const rect = element.getBoundingClientRect();
      setBounding({
        y: rect.top,
        height: rect.height,
      });
    };

    updateBounding();

    const resizeObserver = new ResizeObserver(updateBounding);
    resizeObserver.observe(element);

    const handleScroll = () => {
      updateBounding();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [elementRef]);

  return bounding;
}

export default function usePushHeader(elementRef: React.RefObject<HTMLElement>) {
  const pathname = usePathname();
  const { y, height } = useElementBounding(elementRef);
  const setHeaderTranslate = useSetHeaderTranslate();

  const headerHeightRef = useRef(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const updateHeaderHeight = useCallback(() => {
    const headerEl = document.querySelector("#headerLogo") as HTMLElement;
    if (!headerEl) return;

    const newHeight = headerEl.clientHeight;
    if (newHeight > 0 && headerHeightRef.current !== newHeight) {
      headerHeightRef.current = newHeight;
      setHeaderHeight(newHeight);
    }
  }, []);

  useEffect(() => {
    updateHeaderHeight();

    const headerEl = document.querySelector("#headerLogo") as HTMLElement;
    if (!headerEl) return;

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(headerEl);

    return () => {
      resizeObserver.disconnect();
    };
  }, [pathname, updateHeaderHeight]);

  useEffect(() => {
    if (headerHeight === 0) return;

    let translate = 0;

    if (y > headerHeight || y < (height + headerHeight) * -1) {
      translate = 0;
    } else if (y >= 0) {
      translate = headerHeight - y;
    } else {
      translate = headerHeight - (y * -1 - height);
    }

    setHeaderTranslate(translate);
  }, [y, height, headerHeight, setHeaderTranslate]);
}
