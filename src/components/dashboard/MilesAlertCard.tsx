import { AlertTriangle, Plane } from 'lucide-react';

import useMilesExpiring from '../../hooks/useMilesExpiring';

import { Skeleton } from '@/components/ui/Skeleton';

export default function MilesAlertCard(){
  const { data, isLoading } = useMilesExpiring();
  const expiringTotal = data?.expiringTotal ?? 0;
  const nextExpiryDate = data?.nextExpiryDate ?? '--';
  if (isLoading) return <div className="rounded-lg bg-[--surface] ring-1 ring-[--border] p-5" aria-label="Milhas"><Skeleton className="h-16 w-full" /></div>;
  return (
    <div className="rounded-lg bg-[--surface] ring-1 ring-[--border] p-5" aria-label="Milhas">
      <h3 className="flex items-center gap-2 text-sm font-medium" style={{color:'var(--clr-milhas)'}}>
        <Plane className="w-4 h-4" />
        Milhas
      </h3>
      <p className="mt-2 text-lg font-semibold">{expiringTotal.toLocaleString('pt-BR')} expiram</p>
      <div className="mt-1 text-xs text-slate-600 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        até {nextExpiryDate}
      </div>
    </div>
  );
}
