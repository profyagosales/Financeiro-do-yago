import React, { createContext, useContext, useMemo } from 'react';

function luminanceFromHex(hex: string) {
  const h = hex.replace('#','');
  const r = parseInt(h.substring(0,2),16)/255;
  const g = parseInt(h.substring(2,4),16)/255;
  const b = parseInt(h.substring(4,6),16)/255;
  const toLin = (c: number) => (c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4));
  const R = toLin(r), G = toLin(g), B = toLin(b);
  return 0.2126*R + 0.7152*G + 0.0722*B;
}

function contrastRatio(hex1: string, hex2: string) {
  const L1 = luminanceFromHex(hex1);
  const L2 = luminanceFromHex(hex2);
  const light = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}

function normalizeHex(hex: string) {
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return '#' + h.slice(0,6);
}

function pickText(hex: string) {
  try {
    const base = normalizeHex(hex);
    const white = '#ffffff';
    const dark = '#0f172a';
    const crWhite = contrastRatio(base, white);
    const crDark = contrastRatio(base, dark);
    // Escolhe a cor com maior contraste
    const color = crWhite >= crDark ? white : dark;
    return { color, ratio: Math.max(crWhite, crDark) };
  } catch {
    return { color: 'currentColor', ratio: 1 };
  }
}

export interface SectionChromingProps extends React.HTMLAttributes<HTMLDivElement> {
  clr: 'home' | 'financas' | 'invest' | 'milhas' | 'desejos' | 'mercado' | 'metas';
  decorate?: boolean;
  /** Desativa auditoria automática de contraste se false */
  auditContrast?: boolean;
  /** Threshold WCAG (padrão 4.5 para texto normal) */
  contrastThreshold?: number;
}

interface SectionChromingContextValue {
  section: SectionChromingProps['clr'];
  baseColor: string; // hex
  textColor: string; // hex
  contrastRatio: number;
  lowContrast: boolean;
}

const SectionChromingContext = createContext<SectionChromingContextValue | null>(null);
export const useSectionChroming = () => {
  const ctx = useContext(SectionChromingContext);
  if (!ctx) throw new Error('useSectionChroming deve ser usado dentro de <SectionChroming />');
  return ctx;
};

export const SectionChroming: React.FC<SectionChromingProps> = ({
  clr,
  decorate = false,
  auditContrast = true,
  contrastThreshold = 4.5,
  className = '',
  style,
  children,
  ...rest
}) => {
  const FALLBACK: Record<string,string> = {
    home: '#38BDF8', financas: '#84CC16', invest: '#6366F1', milhas: '#EC4899', desejos: '#F97316', mercado: '#FACC15', metas: '#0EA5E9'
  };
  const base = FALLBACK[clr];
  const { color: text, ratio } = pickText(base);
  const low = auditContrast && ratio < contrastThreshold;
  const decorateStyle = decorate ? {
    backgroundImage: `radial-gradient(at 30% 20%, var(--clr-active)/15%, transparent 70%)`
  } : {};

  const value = useMemo<SectionChromingContextValue>(() => ({
    section: clr,
    baseColor: base,
    textColor: text,
    contrastRatio: ratio,
    lowContrast: low
  }), [clr, base, text, ratio, low]);
  return (
    <SectionChromingContext.Provider value={value}>
      <div
        data-clr={clr}
        data-contrast={low ? 'low' : undefined}
        className={className}
        style={{ ...(style as any), ...(decorateStyle as any), ['--section-fg' as any]: text, color: 'var(--section-fg)' }}
        {...rest}
      >
        {children}
      </div>
    </SectionChromingContext.Provider>
  );
};

export default SectionChroming;
