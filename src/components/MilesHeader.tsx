import type { ReactNode } from 'react';

import { BRANDS, type MilesProgram } from '@/components/miles/brandConfig';

export type { MilesProgram } from '@/components/miles/brandConfig';

export default function MilesHeader({ program, subtitle, children }: { program: MilesProgram; subtitle?: string; children?: ReactNode }) {
  const cfg = BRANDS[program];
  const Logo = cfg.Logo;
  return (
    <header className={`mb-6 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white`}>
      <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Logo className="h-7 w-7 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">Milhas — {cfg.label}</h1>
            {subtitle ? (
              <p className="text-white/80 text-sm leading-relaxed truncate">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </header>
  );
}
