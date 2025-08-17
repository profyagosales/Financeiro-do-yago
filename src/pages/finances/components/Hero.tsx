import type { ReactNode } from 'react';

import { APP_COLORS } from '@/theme/colors';

interface HeroFinProps {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
  colorKey?: keyof typeof APP_COLORS; // default 'fin'
}

const HeroFin = ({ title, children, icon, colorKey = 'fin' }: HeroFinProps) => (
  <section
    className="rounded-xl p-8 shadow-sm bg-gradient-to-b from-[color:var(--clr)]/80 to-[color:var(--clr)]/10 relative overflow-hidden"
    style={{ '--clr': APP_COLORS[colorKey] } as any}
  >
    <h1 className="text-2xl font-semibold text-white flex items-center gap-3 drop-shadow-sm">
      {icon && <span className="shrink-0">{icon}</span>} {title}
    </h1>
    <div className="mt-4 space-y-4 text-white/90">
      {children}
    </div>
  </section>
);

export default HeroFin;
