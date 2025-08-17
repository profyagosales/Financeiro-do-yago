import { CalendarDays, Files, TrendingDown, TrendingUp } from 'lucide-react';

import useFinSummary from '../../hooks/useFinSummary';
import { currency, percent } from '../../utils/format';

import { Skeleton } from '@/components/ui/Skeleton';

function CategoryDot({ color }: { color: string }) {
  return <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />;
}

export default function FinSummaryCard(){
  const { data, isLoading } = useFinSummary();
  const saldo = data?.saldo ?? 0;
  const diff = data?.diff ?? 0;
  const upcoming = data?.upcoming ?? [];
  const up = diff >= 0;
  if (isLoading) return <div className="rounded-lg border-t-4 border-[var(--clr-financas)] bg-white shadow-sm p-6" aria-label="Resumo Financeiro"><Skeleton className="h-24 w-full" /></div>;
  return (
    <div className="rounded-lg border-t-4 border-[var(--clr-financas)] bg-white shadow-sm p-6" aria-label="Resumo Financeiro">
      <h3 className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--clr-financas)' }}>
        <Files className="w-4 h-4" />
        Finanças
      </h3>
      <p className="mt-2 text-2xl font-semibold" aria-live="polite">{currency(saldo)}</p>
      <span className={`inline-flex items-center gap-1 text-xs ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {percent(diff)}
      </span>
      {upcoming?.length > 0 && (
        <ul className="mt-4 space-y-2 text-xs" aria-label="Próximos lançamentos">
          {upcoming.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <CategoryDot color={'var(--clr-financas)'} />
              <CalendarDays className="w-4 h-4 text-neutral-500" />
              <span>{item.desc}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
