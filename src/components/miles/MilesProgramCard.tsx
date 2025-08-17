import { Link, useLocation } from 'react-router-dom';

import { BRANDS, type MilesProgram } from '@/components/miles/brandConfig';
import { cn } from '@/lib/utils';

interface MilesProgramCardProps {
  program: MilesProgram;
  to?: string;
  className?: string;
}

export function MilesProgramCard({ program, to, className }: MilesProgramCardProps) {
  const cfg = BRANDS[program];
  const href = to ?? `/milhas/${program}`;
  const { pathname } = useLocation();
  const active = pathname.startsWith(href);
  return (
    <Link
      to={href}
      aria-label={`Abrir página do programa ${cfg.label}`}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative rounded-2xl p-0.5 shadow transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 overflow-hidden',
        active && 'ring-2 ring-emerald-400/60 scale-[1.02]',
        className
      )}
      style={{
        backgroundImage: `linear-gradient(90deg, ${cfg.realFrom}, ${cfg.realTo})`
      }}
    >
      <div className="rounded-2xl relative p-4 text-center backdrop-blur-sm transition-all duration-200
        bg-white/90 dark:bg-slate-900/85 group-hover:bg-white dark:group-hover:bg-slate-900
        group-hover:shadow-md group-hover:scale-[1.02] ease-out">
        {/* overlay para contraste em dark */}
        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 via-white/0 to-white/10 dark:from-black/20 dark:via-black/10 dark:to-black/40 mix-blend-overlay" />
        <div className="relative z-10">
          <div className="text-[11px] uppercase tracking-wide font-medium text-muted mb-1">Programa</div>
          <div className="text-lg font-semibold tracking-tight text-text dark:text-text-dark drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
            {cfg.label}
          </div>
        </div>
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" />
      {/* brilho sutil ao focar */}
      <span className={cn('pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-70 transition duration-300',
        'bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_60%)]')}/>
    </Link>
  );
}

export default MilesProgramCard;
