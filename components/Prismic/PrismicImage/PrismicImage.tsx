"use client";

import { useGetImageColors } from "@/hooks/query/query-hooks/use-get-image-colors";
import type { ImageField } from "@prismicio/client";
import Image from "next/image";
import { useState } from "react";

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
  fillSpace = false,
  fit = "cover",
  transparent = false,
  muted = true,
  dimensions = { width: -1, height: -1 },
  alt = "",
  url = "",
  field,
}: PrismicImageProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Get image data from Prismic field if provided
  const cmpUrl = field?.url || url || src;
  const cmpWidth = field?.dimensions?.width || dimensions.width;
  const cmpHeight = field?.dimensions?.height || dimensions.height;
  const imageAlt = field?.alt || alt;

  // Fetch image colors using React Query
  const { data: colorsData } = useGetImageColors({
    imageUrl: cmpUrl,
    enabled: !!cmpUrl,
  });

  const colors = colorsData?.dominant_colors || null;

  // Calculate aspect ratio
  let cmpAspect: number;
  if (aspect === -1) {
    if (cmpWidth > 0 && cmpHeight > 0) {
      cmpAspect = (cmpHeight / cmpWidth) * 100;
    } else {
      cmpAspect = 0;
    }
  } else {
    // Parse provided aspect, handling both 56.25 and 0.5625 style
    const toParse = parseFloat(String(aspect));
    cmpAspect = toParse <= 1 ? toParse * 100 : toParse;
  }

  const primaryColor = colors?.vibrant_dark?.hex || "";
  const secondaryColor = colors?.muted_dark?.hex || "";

  const styles = { "--aspect": `${cmpAspect}%` } as React.CSSProperties;

  const wrapperStyles =
    transparent || (!primaryColor && !secondaryColor)
      ? {}
      : {
          backgroundColor: primaryColor,
          backgroundImage: `linear-gradient(${primaryColor}, ${secondaryColor})`,
        };

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
