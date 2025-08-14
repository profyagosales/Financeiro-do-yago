import type { ReactNode } from 'react';

import LiveloLogo from '@/assets/logos/livelo.svg?react';
import LatamPassLogo from '@/assets/logos/latampass.svg?react';
import AzulLogo from '@/assets/logos/azul.svg?react';

export const BRAND = {
  livelo: { name: 'Livelo', color: '#7A1FA2', accent: '#FF2D8D', Logo: LiveloLogo },
  latampass: { name: 'LATAM Pass', color: '#862633', accent: '#E51C44', Logo: LatamPassLogo },
  azul: { name: 'Azul', color: '#1BA1E2', accent: '#0070AD', Logo: AzulLogo },
} as const;

export type MilesProgram = keyof typeof BRAND;

export default function MilesHeader({
  program,
  subtitle = 'Saldo, a receber e expiração',
  children,
}: {
  program: MilesProgram;
  subtitle?: string;
  children?: ReactNode;
}) {
  const { name, color, accent, Logo } = BRAND[program];
  return (
    <div
      className="relative overflow-hidden rounded-2xl border"
      style={{
        borderColor: `${color}33`,
        background: `radial-gradient(1200px 400px at 10% -10%, ${accent}26, transparent 60%), radial-gradient(800px 300px at 110% 10%, ${color}26, transparent 50%)`,
      }}
    >
      <div className="flex items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2" style={{ background: `${color}22` }}>
            <Logo className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{name} — Milhas</h1>
            {subtitle ? <p className="text-sm opacity-75">{subtitle}</p> : null}
          </div>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </div>
  );
}
