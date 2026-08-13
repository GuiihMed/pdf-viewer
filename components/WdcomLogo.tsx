'use client';
import React, { useState } from 'react';

interface WdcomLogoProps {
  height?: number;
  className?: string;
}

export const WdcomLogo: React.FC<WdcomLogoProps> = ({ height = 36, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    // Vector SVG Fallback of the official WDCOM Logo with Cyan accent mark
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', height: `${height}px` }} className={className}>
        <svg height={height} viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cyan diamond/triangle accent above */}
          <path d="M 125,5 L 145,22 L 132,48 L 118,22 Z" fill="#00A3E0" />
          {/* WDCOM Typography in bold white */}
          <text x="5" y="44" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="38" fill="#FFFFFF" letterSpacing="1">
            WDCOM
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', height: `${height}px` }} className={className}>
      <img
        src="/wdcom-main-logo.png"
        alt="WDCOM Logo"
        onError={() => setImgError(true)}
        style={{
          height: `${height}px`,
          width: 'auto',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};
