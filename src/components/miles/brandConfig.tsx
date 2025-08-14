import React from 'react';

export type MilesProgram = 'livelo' | 'latampass' | 'azul';

export function LiveloLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d="M32 4c15 0 28 12 28 28S47 60 32 60 4 48 4 32 17 4 32 4Z" fill="#7A1FA2"/>
      <path d="M20 35c0-7 5-13 12-13s12 6 12 13c0 4-2 7-5 9-4 3-10 3-14 0-3-2-5-5-5-9Z" fill="white"/>
      <text x="32" y="39" textAnchor="middle" fontSize="12" fontWeight="700" fill="#7A1FA2">lv</text>
    </svg>
  );
}

export function LatamPassLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect rx="12" width="64" height="64" fill="#862633"/>
      <path d="M12 36c12-6 20-10 40-12-10 6-18 12-24 20-6 1-10-1-16-8Z" fill="#E51C44"/>
      <path d="M18 44c10-7 19-12 30-14-8 6-14 12-18 18" stroke="white" strokeWidth="2" fill="none"/>
    </svg>
  );
}

export function AzulLogo({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect rx="12" width="64" height="64" fill="#1BA1E2"/>
      <g fill="#0070AD">
        <rect x="18" y="22" width="8" height="8" rx="1"/>
        <rect x="28" y="22" width="8" height="8" rx="1"/>
        <rect x="24" y="32" width="8" height="8" rx="1"/>
        <rect x="34" y="32" width="8" height="8" rx="1"/>
        <rect x="30" y="42" width="8" height="8" rx="1"/>
      </g>
    </svg>
  );
}

export const BRANDS: Record<MilesProgram, { label: string; gradient: string; soft: string; softDark: string; Logo: (props: { className?: string }) => JSX.Element }> = {
  livelo: {
    label: 'Livelo',
    gradient: 'from-[#7A1FA2] to-[#FF2D8D] dark:from-[#7A1FA2CC] dark:to-[#FF2D8D99]',
    soft: '#F7F1FA',
    softDark: '#7A1FA21A',
    Logo: LiveloLogo,
  },
  latampass: {
    label: 'LATAM Pass',
    gradient: 'from-[#862633] to-[#E51C44] dark:from-[#862633CC] dark:to-[#E51C4499]',
    soft: '#FBF2F4',
    softDark: '#8626331A',
    Logo: LatamPassLogo,
  },
  azul: {
    label: 'Azul',
    gradient: 'from-[#1BA1E2] to-[#0070AD] dark:from-[#1BA1E2CC] dark:to-[#0070AD99]',
    soft: '#EEF8FF',
    softDark: '#1BA1E21A',
    Logo: AzulLogo,
  },
};

export default BRANDS;

