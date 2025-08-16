import type { ReactNode } from 'react';

import { KPI_TONE_STYLES, type KpiTone } from './kpiTones.ts';

import { MotionCard } from '@/components/ui/MotionCard';
import { cn } from '@/lib/utils';

export type KPIStatProps = {
  label: string;
  value: ReactNode; // já formatado ou componente AnimatedNumber
  icon?: ReactNode;
  hint?: string;
  className?: string;
  tone?: KpiTone;
  loading?: boolean;
  asChild?: boolean; // permite passar um MotionCard custom via Slot pattern no futuro
};

export function KPIStat({ label, value, icon, hint, className, tone='slate', loading, asChild }: KPIStatProps) {
  const Wrapper: any = asChild ? 'div' : MotionCard;
  return (
    <Wrapper className={cn('flex items-center gap-3 p-4 lg:col-span-3', className)}>
      {icon && (
        <div className={cn('p-2 rounded-full shrink-0', KPI_TONE_STYLES[tone])} aria-hidden>
          {icon}
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span className="text-sm text-fg-muted truncate">{label}</span>
        <span className={cn('font-medium text-base sm:text-lg tabular-nums', loading && 'opacity-50')}>
          {value}
        </span>
        {hint && <span className="sr-only">{hint}</span>}
      </div>
  </Wrapper>
  );
}
