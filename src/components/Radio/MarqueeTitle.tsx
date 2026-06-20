import React, { useRef, useState, useEffect } from "react";
import { cleanTitle } from "../../utils/radioUtils";

interface MarqueeTitleProps {
  title: string;
  className?: string;
}

export const MarqueeTitle = ({ title, className }: MarqueeTitleProps) => {
  const clean = cleanTitle(title);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setShouldScroll(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [clean]);

  if (!shouldScroll) {
    return (
      <div ref={containerRef} style={{ width: "100%", overflow: "hidden", whiteSpace: "nowrap" }}>
        <span ref={textRef} className={className}>{clean}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="marquee-container" style={{ flex: 1, minWidth: 0, width: "100%" }}>
      <div className="marquee-content">
        <span ref={textRef} className={className}>{clean}</span>
        <span className={className} style={{ paddingLeft: "50px" }}>{clean}</span>
      </div>
    </div>
  );
};
