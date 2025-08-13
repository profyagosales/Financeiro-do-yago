import type { ReactNode } from 'react';
import { Icon } from '@iconify/react';

import PageHeader from '@/components/PageHeader';

export type MilesProgram = 'livelo' | 'latam' | 'azul';

const PROGRAM: Record<MilesProgram, { label: string; icon: string; gradient: string }> = {
  livelo: { label: 'Livelo', icon: 'simple-icons:livelo', gradient: 'from-fuchsia-600 to-pink-500' },
  latam: { label: 'LATAM Pass', icon: 'simple-icons:latamairlines', gradient: 'from-rose-600 to-purple-600' },
  azul: { label: 'Azul', icon: 'simple-icons:azul', gradient: 'from-sky-600 to-blue-700' },
};

export default function MilesHeader({ program, subtitle, children }: { program: MilesProgram; subtitle?: string; children?: ReactNode }) {
  const cfg = PROGRAM[program];
  return (
    <PageHeader
      title={`Milhas — ${cfg.label}`}
      subtitle={subtitle}
      icon={<Icon icon={cfg.icon} className="h-7 w-7 shrink-0" />}
      actions={children}
      gradient={cfg.gradient}
    />
  );
}
