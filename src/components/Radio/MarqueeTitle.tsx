import React from "react";
import { cleanTitle } from "../../utils/radioUtils";

interface MarqueeTitleProps {
  title: string;
  className?: string;
}

export const MarqueeTitle = ({ title, className }: MarqueeTitleProps) => {
  const clean = cleanTitle(title);
  const shouldScroll = clean.length > 25;

  if (!shouldScroll) {
    return <span className={className}>{clean}</span>;
  }

  return (
    <div className="marquee-container" style={{ flex: 1, minWidth: 0 }}>
      <div className="marquee-content">
        <span className={className}>{clean}</span>
        <span className={className} style={{ paddingLeft: "50px" }}>{clean}</span>
      </div>
    </div>
  );
};
