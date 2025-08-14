import type { ReactNode } from 'react';

import azulLogo from '@/assets/logos/azul.svg';
import latamLogo from '@/assets/logos/latampass.svg';
import liveloLogo from '@/assets/logos/livelo.svg';

export type MilesProgram = 'livelo' | 'latampass' | 'azul';

export const brandConfig: Record<MilesProgram, { label: string; logo: string; gradient: string }> = {
  livelo: {
    label: 'Livelo',
    logo: liveloLogo,
    gradient: 'from-fuchsia-600 via-pink-500 to-rose-500',
  },
  latampass: {
    label: 'LATAM Pass',
    logo: latamLogo,
    gradient: 'from-red-600 via-rose-600 to-purple-600',
  },
  azul: {
    label: 'Azul',
    logo: azulLogo,
    gradient: 'from-sky-600 via-cyan-600 to-blue-600',
  },
};

export default function MilesHeader({
  program,
  subtitle,
  children,
}: {
  program: MilesProgram;
  subtitle?: string;
  children?: ReactNode;
}) {
  const cfg = brandConfig[program];
  return (
    <header className={`mb-6 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white`}>
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <img src={cfg.logo} alt={cfg.label} className="h-7 w-auto shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">Milhas — {cfg.label}</h1>
            {subtitle ? (
              <p className="truncate text-sm leading-relaxed text-white/80">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </header>
  );
}
