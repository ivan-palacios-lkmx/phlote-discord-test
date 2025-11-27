"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import "./ProgressRing.scss";

interface ProgressRingProps extends React.SVGProps<SVGSVGElement> {
  progress?: number;
}

const ProgressRing = ({ progress = 0, ...props }: ProgressRingProps) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const [circleLength, setCircleLength] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    updateWindowWidth();
    window.addEventListener("resize", updateWindowWidth);

    return () => {
      window.removeEventListener("resize", updateWindowWidth);
    };
  }, []);

  const calculateCircleLength = () => {
    if (circleRef.current) {
      const length = circleRef.current.getTotalLength();
      setCircleLength(length);
    }
  };

  useEffect(() => {
    calculateCircleLength();
  }, []);

  useEffect(() => {
    calculateCircleLength();
  }, [windowWidth]);

  const circleProgress = useMemo(() => {
    if (circleLength === 0) return 0;
    return circleLength - circleLength * progress;
  }, [circleLength, progress]);

  const styles = useMemo(() => {
    return {
      "--circle-length": circleLength,
      "--circle-progress": circleProgress,
    } as React.CSSProperties;
  }, [circleLength, circleProgress]);

  return (
    <svg
      ref={containerRef}
      className="svg-progress-ring"
      width="30"
      height="30"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={styles}
      {...props}>
      <circle id="bg" cx="50" cy="50" r="40" strokeWidth="4" />
      <circle
        id="circle"
        ref={circleRef}
        cx="50"
        cy="50"
        r="40"
        stroke="currentColor"
        strokeWidth="4"
      />
    </svg>
  );
};

export default ProgressRing;
