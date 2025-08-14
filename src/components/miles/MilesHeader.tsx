import type { ReactNode } from 'react';

import BRANDS, { type MilesProgram } from './brandConfig';

export type { MilesProgram } from './brandConfig';

export default function MilesHeader({
  program,
  subtitle,
  counters = [],
  children,
}: {
  program: MilesProgram;
  subtitle?: string;
  counters?: { label: string; value: ReactNode }[];
  children?: ReactNode;
}) {
  const cfg = BRANDS[program];
  const primaryColor =
    cfg.gradient.match(/from-\[(#[0-9A-Fa-f]{6})\]/)?.[1] ?? '#000000';
  const Logo = cfg.Logo;
  return (
    <header className={`mb-6 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white`}>
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <Logo className="h-7 w-7 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">Milhas — {cfg.label}</h1>
            {subtitle ? (
              <p className="truncate text-sm leading-relaxed text-white/80">{subtitle}</p>
            ) : null}
          </div>
          {counters.length ? (
            <div className="ml-4 flex shrink-0 gap-2">
              {counters.map((c) => (
                <div
                  key={c.label}
                  className="rounded-lg px-3 py-2 text-center"
                  style={{ backgroundColor: cfg.soft, color: primaryColor }}
                >
                  <div className="text-xs font-medium">{c.label}</div>
                  <div className="text-lg font-semibold leading-none">{c.value}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </header>
  );
}
