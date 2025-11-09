"use client";

import type { ImageField } from "@prismicio/client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import "./PrismicImage.scss";

const defaultSizes = [null, 1920, 1100, 800, 500];

interface PrismicImageProps {
  wrapper?: keyof JSX.IntrinsicElements;
  videoSrc?: string;
  src?: string;
  aspect?: string | number;
  innerWrapper?: keyof JSX.IntrinsicElements;
  sizes?: (number | null)[];
  transition?: string;
  hidePreview?: boolean;
  fillSpace?: boolean;
  fit?: "cover" | "contain";
  transparent?: boolean;
  muted?: boolean;
  // Prismic props
  dimensions?: { width: number; height: number };
  alt?: string;
  url?: string;
  field?: ImageField;
}

export default function PrismicImage({
  wrapper: Wrapper = "div",
  videoSrc = "",
  src = "",
  aspect = -1,
  innerWrapper: InnerWrapper = "div",
  sizes = defaultSizes,
  transition = "fade",
  hidePreview = false,
  fillSpace = false,
  fit = "cover",
  transparent = false,
  muted = true,
  dimensions = { width: -1, height: -1 },
  alt = "",
  url = "",
  field,
}: PrismicImageProps) {
  const [colors, setColors] = useState<{
    vibrant_dark?: { hex: string };
    muted_dark?: { hex: string };
  } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Get image data from Prismic field if provided
  const cmpUrl = useMemo(() => {
    if (field?.url) return field.url;
    if (url) return url;
    return src;
  }, [field, url, src]);

  const cmpWidth = useMemo(() => {
    if (field?.dimensions?.width) return field.dimensions.width;
    return dimensions.width;
  }, [field, dimensions.width]);

  const cmpHeight = useMemo(() => {
    if (field?.dimensions?.height) return field.dimensions.height;
    return dimensions.height;
  }, [field, dimensions.height]);

  const imageAlt = useMemo(() => {
    if (field?.alt) return field.alt;
    return alt;
  }, [field, alt]);

  const cmpAspect = useMemo(() => {
    // Calculate if no aspect provided
    if (aspect === -1) {
      if (cmpWidth > 0 && cmpHeight > 0) {
        return (cmpHeight / cmpWidth) * 100;
      }
      return 0;
    }
    // Otherwise, parse provided aspect, handling both 56.25 and 0.5625 style
    const toParse = parseFloat(String(aspect));
    return toParse <= 1 ? toParse * 100 : toParse;
  }, [aspect, cmpWidth, cmpHeight]);

  const cmpSrcset = useMemo(() => {
    if (!cmpUrl) return "";
    return sizes
      .map((size) => {
        const width = size === null ? cmpWidth : size;
        if (width <= 0) return "";
        const height = Math.round(width / (cmpAspect / 100));
        return `${cmpUrl}&w=${width}&h=${height} ${width}w`;
      })
      .filter(Boolean)
      .join(", ");
  }, [cmpUrl, sizes, cmpWidth, cmpAspect]);

  const primaryColor = useMemo(() => {
    return colors?.vibrant_dark?.hex || "";
  }, [colors]);

  const secondaryColor = useMemo(() => {
    return colors?.muted_dark?.hex || "";
  }, [colors]);

  const styles = useMemo(() => {
    return { "--aspect": `${cmpAspect}%` } as React.CSSProperties;
  }, [cmpAspect]);

  const wrapperStyles = useMemo(() => {
    if (transparent) return {};
    if (!primaryColor && !secondaryColor) return {};
    return {
      backgroundColor: primaryColor,
      backgroundImage: `linear-gradient(${primaryColor}, ${secondaryColor})`,
    };
  }, [transparent, primaryColor, secondaryColor]);

  // Watch cmpUrl for color fetching (equivalent to Vue watch)
  useEffect(() => {
    setColors(null);
    if (!cmpUrl) return;

    const stripped = cmpUrl.replace(/\?.+/g, "");
    fetch(`${stripped}?palette=json`)
      .then((r) => r.json())
      .then((res) => {
        if (res && res.colors && res.colors.length) {
          setColors(res.dominant_colors);
        }
      })
      .catch((err) => {
        console.log("color error: ", err);
      });
  }, [cmpUrl]);

  if (!cmpUrl) return null;

  return (
    <Wrapper
      className={[
        "prismic-image",
        fillSpace && "fill-space",
        `fit-${fit}`,
        videoSrc && videoLoaded && "video-loaded",
      ]
        .filter(Boolean)
        .join(" ")}
      style={styles}>
      <InnerWrapper className="image-sizer" style={wrapperStyles}>
        <Image
          src={cmpUrl}
          width={cmpWidth > 0 ? cmpWidth : undefined}
          height={cmpHeight > 0 ? cmpHeight : undefined}
          alt={imageAlt}
          className="media media-image"
        />
        {videoSrc && (
          <video
            height={cmpHeight > 0 ? cmpHeight : undefined}
            width={cmpWidth > 0 ? cmpWidth : undefined}
            src={videoSrc}
            className="media media-video"
            playsInline
            autoPlay
            muted={muted}
            loop
            onCanPlay={() => setVideoLoaded(true)}
          />
        )}
      </InnerWrapper>
    </Wrapper>
  );
}
