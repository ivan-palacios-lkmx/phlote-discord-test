"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import "./MultiRangeSlider.scss";

interface MultiRangeSliderProps {
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
}

export default function MultiRangeSlider({ min, max, value, onChange }: MultiRangeSliderProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Local state for lower and upper
  const [lower, setLower] = useState(value.min);
  const [upper, setUpper] = useState(value.max);

  // Update local state when value prop changes
  useEffect(() => {
    setLower(value.min);
    setUpper(value.max);
  }, [value.min, value.max]);

  // Get element width
  useEffect(() => {
    if (!elRef.current) return;

    const updateWidth = () => {
      if (elRef.current) {
        setWidth(elRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    // Use ResizeObserver for more accurate updates
    const resizeObserver = new ResizeObserver(updateWidth);
    if (elRef.current) {
      resizeObserver.observe(elRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateWidth);
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate percentages
  const lowerP = useMemo(() => {
    return (lower - min) / (max - min);
  }, [lower, min, max]);

  const upperP = useMemo(() => {
    return (upper - min) / (max - min);
  }, [upper, min, max]);

  // Container style with CSS variables
  const containerStyle = useMemo(() => {
    return {
      "--lower-p": `${lowerP * 100}%`,
      "--upper-p": `${upperP * 100}%`,
    } as React.CSSProperties & { "--lower-p": string; "--upper-p": string };
  }, [lowerP, upperP]);

  // Lower thumb style
  const lowerThumbStyle = useMemo(() => {
    const x = lowerP * width;
    const adjustedX = x - 30 * lowerP;
    return {
      transform: `translateX(${adjustedX}px)`,
    };
  }, [lowerP, width]);

  // Upper thumb style
  const upperThumbStyle = useMemo(() => {
    const x = upperP * width;
    const adjustedX = x - 30 * upperP;
    return {
      transform: `translateX(${adjustedX}px)`,
    };
  }, [upperP, width]);

  // Handle lower input change
  const handleLowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLower = parseInt(e.target.value, 10);
    if (newLower <= upper) {
      setLower(newLower);
      onChange({ min: newLower, max: upper });
    }
  };

  // Handle upper input change
  const handleUpperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUpper = parseInt(e.target.value, 10);
    if (newUpper >= lower) {
      setUpper(newUpper);
      onChange({ min: lower, max: newUpper });
    }
  };

  return (
    <div className="multi-range-slider" ref={elRef} style={containerStyle}>
      <input
        type="range"
        min={min}
        max={upper}
        value={lower}
        onChange={handleLowerChange}
        className="lower default-styling"
      />
      <input
        type="range"
        min={lower}
        max={max}
        value={upper}
        onChange={handleUpperChange}
        className="upper default-styling"
      />

      <div className="track">
        <div className="active-range" />
      </div>

      <div className="thumb-label" style={lowerThumbStyle}>
        <span>{lower}</span>
      </div>
      <div className="thumb-label" style={upperThumbStyle}>
        <span>{upper}</span>
      </div>
    </div>
  );
}
