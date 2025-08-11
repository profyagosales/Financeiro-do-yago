import type { ReactNode } from 'react';
import { Icon } from '@iconify/react';

export type MilesProgram = 'livelo' | 'latam' | 'azul';

const PROGRAM: Record<MilesProgram, { label: string; icon: string; gradient: string }> = {
  livelo: { label: 'Livelo', icon: 'simple-icons:livelo', gradient: 'from-fuchsia-600 to-pink-500' },
  latam: { label: 'LATAM Pass', icon: 'simple-icons:latamairlines', gradient: 'from-rose-600 to-purple-600' },
  azul: { label: 'Azul', icon: 'simple-icons:azul', gradient: 'from-sky-600 to-blue-700' },
};

export default function MilesHeader({ program, subtitle, children }: { program: MilesProgram; subtitle?: string; children?: ReactNode }) {
  const cfg = PROGRAM[program];
  return (
    <header className={`mb-6 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white`}>
      <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Icon icon={cfg.icon} className="h-7 w-7 shrink-0" />
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
