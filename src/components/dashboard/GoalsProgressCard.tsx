import { Target } from 'lucide-react';

import useGoalsProgress from '@/hooks/useGoalsProgress';
import { Skeleton } from '@/components/ui/Skeleton';

export default function GoalsProgressCard(){
  const { data, isLoading } = useGoalsProgress();
  const completed = data?.completed ?? 0;
  const total = data?.total ?? 0;
  const percentVal = data?.percent ?? 0;
  if (isLoading) return <div className="rounded-lg bg-[--surface] ring-1 ring-[--border] p-5" aria-label="Metas"><Skeleton className="h-20 w-full" /></div>;
  return (
    <div className="rounded-lg bg-[--surface] ring-1 ring-[--border] p-5" aria-label="Metas">
      <h3 className="flex items-center gap-2 text-sm font-medium" style={{color:'var(--clr-metas)'}}>
        <Target className="w-4 h-4" />
        Metas
      </h3>
  <p className="mt-2 text-2xl font-semibold">{percentVal.toFixed(0)}%</p>
  <span className="text-xs text-slate-600">{completed} de {total} concluídas</span>
    </div>
  );
}
