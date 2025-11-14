"use client";

import { useGetImageColors } from "@/hooks/query/query-hooks/use-get-image-colors";
import { ProgressiveMediaProps } from "@/types/client";
import Image from "next/image";
import { useState } from "react";

import "./ProgressiveMedia.scss";

export default function ProgressiveMedia({
  wrapper: Wrapper = "div",
  videoSrc = "",
  src = "",
  aspect = null,
  innerWrapper: InnerWrapper = "div",
  fillSpace = false,
  fit = "cover",
  transparent = false,
  muted = true,
  dimensions = { width: -1, height: -1 },
  alt = "",
  url = "",
  field,
}: ProgressiveMediaProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);

  const canShowVideo = videoSrc && videoLoaded;
  const imageUrl = field?.url || url || src;
  const imageWidth = field?.dimensions?.width || dimensions.width;
  const imageHeight = field?.dimensions?.height || dimensions.height;
  const altText = field?.alt || alt;

  const { data: imageColors } = useGetImageColors({
    imageUrl: imageUrl,
    enabled: !!imageUrl,
  });

  let wrapperAspectRatio: number;

  if (aspect === null) {
    if (imageWidth > 0 && imageHeight > 0) {
      wrapperAspectRatio = (imageHeight / imageWidth) * 100;
    } else {
      wrapperAspectRatio = 0;
    }
  } else {
    const toParse = parseFloat(String(aspect));
    wrapperAspectRatio = toParse <= 1 ? toParse * 100 : toParse;
  }

  const WrapperStyles = { "--aspect": `${wrapperAspectRatio}%` } as React.CSSProperties;

  const shouldInnerWrapperHaveStyles =
    transparent || (!imageColors?.primary && !imageColors?.secondary);

  if (!imageUrl) return null;

  return (
    <Wrapper
      className={[
        "prismic-image",
        fillSpace && "fill-space",
        `fit-${fit}`,
        canShowVideo && "video-loaded",
      ]
        .filter(Boolean)
        .join(" ")}
      style={WrapperStyles}>
      <InnerWrapper
        className="image-sizer"
        style={
          shouldInnerWrapperHaveStyles
            ? {
                backgroundColor: imageColors?.primary,
                backgroundImage: `linear-gradient(${imageColors?.primary}, ${imageColors?.secondary})`,
              }
            : {}
        }>
        <Image
          src={imageUrl}
          width={imageWidth > 0 ? imageWidth : undefined}
          height={imageHeight > 0 ? imageHeight : undefined}
          alt={altText}
          className="media media-image"
        />
        {videoSrc && (
          <video
            height={imageHeight > 0 ? imageHeight : undefined}
            width={imageWidth > 0 ? imageWidth : undefined}
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
