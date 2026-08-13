'use client';
import React from 'react';

interface WdcomLogoProps {
  size?: number;
  showText?: boolean;
}

export const WdcomLogo: React.FC<WdcomLogoProps> = ({ size = 38, showText = true }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* High Quality Inline SVG W-Logo Mark */}
      <svg
        width={size}
        height={size * (300 / 480)}
        viewBox="0 0 480 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Stroke 1 (Left Curve - Dark Blue) */}
        <path
          d="M 20,60 C 20,30 65,30 115,30 L 155,30 C 160,30 165,34 162,39 L 242,245 C 245,252 238,260 228,260 L 125,260 C 75,260 40,210 20,130 Z"
          fill="#18698E"
        />
        {/* Stroke 2 (Middle Curve - Dark Blue) */}
        <path
          d="M 160,60 C 160,30 205,30 255,30 L 295,30 C 300,30 305,34 302,39 L 382,245 C 385,252 378,260 368,260 L 265,260 C 215,260 180,210 160,130 Z"
          fill="#18698E"
        />
        {/* Stroke 3 (Right Slanted Wing - Vibrant Cyan Blue) */}
        <path
          d="M 320,60 C 320,30 365,30 465,30 L 465,32 C 455,45 425,110 395,175 C 375,215 365,235 360,237 C 356,239 350,225 348,220 L 320,60 Z"
          fill="#00A3E0"
        />
      </svg>

      {showText && (
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
            <span style={{ color: '#00A3E0' }}>WDCOM</span> <span style={{ color: '#ffffff', fontWeight: 600 }}>PDF</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500, marginTop: '2px' }}>
            Plataforma por <strong style={{ color: '#00A3E0' }}>WDCOM</strong>
          </div>
        </div>
      )}
    </div>
  );
};
