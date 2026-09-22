import React from 'react';

export type PixelIconType = 
  | 'coin'
  | 'food'
  | 'game'
  | 'chest'
  | 'potion'
  | 'sword'
  | 'shield'
  | 'scroll'
  | 'house'
  | 'sparkle'
  | 'heart'
  | 'wallet'
  | 'alarm'
  | 'plus'
  | 'trophy'
  | 'user';

interface PixelIconProps {
  name: PixelIconType | string;
  size?: number;
  className?: string;
}

export const PixelIcon: React.FC<PixelIconProps> = ({ name, size = 24, className = '' }) => {
  const pixelSize = size;

  switch (name) {
    case 'coin':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          {/* Pixel Coin */}
          <rect x="5" y="2" width="6" height="2" fill="#F59E0B" />
          <rect x="3" y="4" width="10" height="2" fill="#F59E0B" />
          <rect x="2" y="6" width="12" height="4" fill="#FBBF24" />
          <rect x="3" y="10" width="10" height="2" fill="#F59E0B" />
          <rect x="5" y="12" width="6" height="2" fill="#D97706" />
          {/* Inner Coin Sparkle */}
          <rect x="6" y="6" width="4" height="4" fill="#FEF08A" />
          <rect x="7" y="7" width="2" height="2" fill="#B45309" />
          {/* Border */}
          <rect x="5" y="1" width="6" height="1" fill="#78350F" />
          <rect x="5" y="14" width="6" height="1" fill="#78350F" />
          <rect x="2" y="4" width="1" height="8" fill="#78350F" />
          <rect x="13" y="4" width="1" height="8" fill="#78350F" />
        </svg>
      );

    case 'food':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="4" y="2" width="8" height="3" fill="#10B981" />
          <rect x="2" y="5" width="12" height="6" fill="#F97316" />
          <rect x="4" y="11" width="8" height="2" fill="#EA580C" />
          <rect x="5" y="13" width="6" height="1" fill="#9A3412" />
          <rect x="6" y="7" width="4" height="2" fill="#FEF08A" />
        </svg>
      );

    case 'game':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="2" y="4" width="12" height="8" fill="#6366F1" />
          <rect x="4" y="6" width="3" height="4" fill="#1E1B4B" />
          <rect x="3" y="7" width="5" height="2" fill="#1E1B4B" />
          <rect x="10" y="6" width="2" height="2" fill="#EF4444" />
          <rect x="12" y="8" width="2" height="2" fill="#FBBF24" />
        </svg>
      );

    case 'chest':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="2" y="3" width="12" height="4" fill="#B45309" />
          <rect x="1" y="7" width="14" height="6" fill="#92400E" />
          <rect x="7" y="6" width="2" height="3" fill="#FBBF24" />
          <rect x="2" y="3" width="1" height="10" fill="#78350F" />
          <rect x="13" y="3" width="1" height="10" fill="#78350F" />
          <rect x="3" y="7" width="10" height="1" fill="#451A03" />
        </svg>
      );

    case 'potion':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="6" y="1" width="4" height="2" fill="#E2E8F0" />
          <rect x="7" y="3" width="2" height="2" fill="#94A3B8" />
          <rect x="4" y="5" width="8" height="8" fill="#F43F5E" />
          <rect x="5" y="6" width="3" height="2" fill="#FDA4AF" />
          <rect x="5" y="13" width="6" height="2" fill="#E11D48" />
        </svg>
      );

    case 'sword':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="12" y="2" width="2" height="2" fill="#38BDF8" />
          <rect x="10" y="4" width="2" height="2" fill="#38BDF8" />
          <rect x="8" y="6" width="2" height="2" fill="#0284C7" />
          <rect x="6" y="8" width="2" height="2" fill="#0284C7" />
          <rect x="3" y="9" width="4" height="2" fill="#F59E0B" />
          <rect x="5" y="11" width="2" height="3" fill="#78350F" />
          <rect x="4" y="14" width="2" height="2" fill="#D97706" />
        </svg>
      );

    case 'shield':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="3" y="2" width="10" height="4" fill="#3B82F6" />
          <rect x="3" y="6" width="10" height="4" fill="#1D4ED8" />
          <rect x="5" y="10" width="6" height="3" fill="#1E40AF" />
          <rect x="7" y="13" width="2" height="2" fill="#172554" />
          <rect x="7" y="4" width="2" height="5" fill="#FEF08A" />
        </svg>
      );

    case 'scroll':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="2" y="2" width="12" height="2" fill="#FDE047" />
          <rect x="3" y="4" width="10" height="8" fill="#FEF9C3" />
          <rect x="2" y="12" width="12" height="2" fill="#FDE047" />
          <rect x="5" y="6" width="6" height="1" fill="#713F12" />
          <rect x="5" y="8" width="6" height="1" fill="#713F12" />
          <rect x="5" y="10" width="4" height="1" fill="#713F12" />
        </svg>
      );

    case 'house':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="7" y="2" width="2" height="2" fill="#EF4444" />
          <rect x="5" y="4" width="6" height="2" fill="#DC2626" />
          <rect x="3" y="6" width="10" height="2" fill="#B91C1C" />
          <rect x="3" y="8" width="10" height="6" fill="#F59E0B" />
          <rect x="6" y="10" width="4" height="4" fill="#78350F" />
        </svg>
      );

    case 'sparkle':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="7" y="2" width="2" height="4" fill="#A855F7" />
          <rect x="2" y="7" width="4" height="2" fill="#A855F7" />
          <rect x="6" y="6" width="4" height="4" fill="#F3E8FF" />
          <rect x="10" y="7" width="4" height="2" fill="#A855F7" />
          <rect x="7" y="10" width="2" height="4" fill="#A855F7" />
        </svg>
      );

    case 'heart':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="3" y="3" width="4" height="3" fill="#EF4444" />
          <rect x="9" y="3" width="4" height="3" fill="#EF4444" />
          <rect x="2" y="5" width="12" height="4" fill="#EF4444" />
          <rect x="4" y="9" width="8" height="2" fill="#DC2626" />
          <rect x="6" y="11" width="4" height="2" fill="#B91C1C" />
          <rect x="7" y="13" width="2" height="1" fill="#7F1D1D" />
          <rect x="4" y="4" width="1" height="1" fill="#FCA5A5" />
        </svg>
      );

    case 'wallet':
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="2" y="4" width="12" height="9" fill="#0D9488" />
          <rect x="2" y="3" width="12" height="2" fill="#14B8A6" />
          <rect x="10" y="7" width="4" height="3" fill="#042F2E" />
          <rect x="11" y="8" width="1" height="1" fill="#FDE047" />
        </svg>
      );

    default:
      return (
        <svg width={pixelSize} height={pixelSize} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`}>
          <rect x="4" y="4" width="8" height="8" fill="#3B82F6" />
          <rect x="6" y="6" width="4" height="4" fill="#93C5FD" />
        </svg>
      );
  }
};
