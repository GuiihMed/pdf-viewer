'use client';
import React from 'react';

interface WdcomLogoProps {
  height?: number;
  className?: string;
}

export const WdcomLogo: React.FC<WdcomLogoProps> = ({ height = 36, className = '' }) => {
  // Pure Inline Vector SVG - 100% Reliable, Instant Load, No Broken Image Icons Ever
  const width = Math.round(height * (230 / 52));

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', height: `${height}px` }} className={className}>
      <svg
        height={height}
        width={width}
        viewBox="0 0 230 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: `${height}px`, width: 'auto', display: 'block' }}
      >
        {/* Slanted Cyan Accent Mark (Bright Cyan Wedge) */}
        <path
          d="M 132 4 L 152 18 L 138 46 L 124 22 Z"
          fill="#00A3E0"
        />

        {/* WDCOM Typography in bold white geometric font */}
        <text
          x="2"
          y="41"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontWeight="900"
          fontSize="38"
          fill="#FFFFFF"
          letterSpacing="1"
        >
          WDCOM
        </text>
      </svg>
    </div>
  );
};
