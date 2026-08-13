'use client';
import React from 'react';

interface WdcomLogoProps {
  height?: number;
  className?: string;
}

export const WdcomLogo: React.FC<WdcomLogoProps> = ({ height = 36, className = '' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', height: `${height}px` }} className={className}>
      <img
        src="/wdcom-logo.png"
        alt="WDCOM Logo"
        style={{
          height: `${height}px`,
          width: 'auto',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
};
