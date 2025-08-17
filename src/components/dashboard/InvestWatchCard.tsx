import { Landmark, TrendingDown, TrendingUp } from 'lucide-react';

import useInvestWatch from '../../hooks/useInvestWatch';
import { percent } from '../../utils/format';

import { Skeleton } from '@/components/ui/Skeleton';

export default function InvestWatchCard(){
  const { data, isLoading } = useInvestWatch();
  const total = data?.total ?? 0;
  const dailyChange = data?.dailyChange ?? 0;
  const up = dailyChange >= 0;
  if (isLoading) return <div className="rounded-lg border-t-4 border-[var(--clr-invest)] bg-white shadow-sm p-6" aria-label="Investimentos"><Skeleton className="h-20 w-full" /></div>;
  return (
    <div className="rounded-lg border-t-4 border-[var(--clr-invest)] bg-white shadow-sm p-6" aria-label="Investimentos">
      <h3 className="flex items-center gap-2 text-sm font-medium" style={{color:'var(--clr-invest)'}}>
        <Landmark className="w-4 h-4" />
        Investimentos
      </h3>
      <p className="mt-2 text-2xl font-semibold">{total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p>
      <span className={`inline-flex items-center gap-1 text-xs ${up?'text-emerald-600':'text-rose-600'}`}>
        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {percent(dailyChange)} hoje
      </span>
    </div>
  );
}
