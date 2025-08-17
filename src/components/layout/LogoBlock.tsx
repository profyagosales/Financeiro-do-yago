import * as React from 'react';
import { Link } from 'react-router-dom';

import Logo from '@/components/Logo';

interface LogoBlockProps {
  color?: string; // cor dinâmica baseada na rota ativa
}

// Cor padrão da marca (logo atual salvo) para fallback
const DEFAULT_BRAND_COLOR = '#10B981';

export default function LogoBlock({ color }: LogoBlockProps) {
  // Sanitiza a cor: evita cores muito claras para manter contraste suficiente com o fundo translúcido.
  const safeColor = React.useMemo(() => {
    if (!color) return DEFAULT_BRAND_COLOR;
    // Se for uma CSS var (var(--clr-...)) apenas retorna — presume-se já validada.
    if (color.startsWith('var(')) return color;
    // Ajuste simples de luminância: se a cor for muito clara, escurece um pouco.
    try {
      const hex = color.replace('#','');
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0,2),16);
        const g = parseInt(hex.slice(2,4),16);
        const b = parseInt(hex.slice(4,6),16);
        const lum = (0.2126*r + 0.7152*g + 0.0722*b)/255;
        if (lum > 0.72) { // muito claro -> escurece 20%
          const darken = (c:number)=> Math.max(0, Math.round(c*0.8));
          return `rgb(${darken(r)} ${darken(g)} ${darken(b)})`;
        }
      }
      return color;
    } catch {
      return DEFAULT_BRAND_COLOR;
    }
  }, [color]);

  return (
    <aside
      className="logo-block row-span-2 flex h-full w-[var(--logo-w)] select-none flex-col items-start justify-center pl-6 pr-0 border-r border-white/10"
      style={{ ['--logo-w' as any]: '200px' }}
    >
      <Link
        to="/"
        className="pointer-events-auto group flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--clr)]"
        aria-label="Início"
        style={{ ['--brand-color' as any]: safeColor }}
      >
        <Logo className="h-14 w-14 transition-transform group-hover:scale-[1.05] drop-shadow-sm logo-dynamic-transition logo-dynamic-pop" monochrome color="var(--brand-color)" />
        <span
          className="flex flex-col leading-tight text-[color:var(--brand-color)] logo-dynamic-transition logo-dynamic-pop"
        >
          <span className="font-bold tracking-tight text-[1.37rem] leading-[1.05]">Finanças</span>
          <span className="font-semibold text-[0.87rem] -mt-0.5 leading-[1.05]">do Yago</span>
        </span>
      </Link>
    </aside>
  );
}
