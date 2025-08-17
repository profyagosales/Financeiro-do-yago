import { Landmark, TrendingDown, TrendingUp } from 'lucide-react';

import useInvestWatch from '../../hooks/useInvestWatch';
import { percent } from '../../utils/format';

export default function InvestWatchCard(){
  const { total, dailyChange } = useInvestWatch();
  const up = dailyChange >= 0;
  return (
    <div className="rounded-lg bg-[--surface] ring-1 ring-[--border] p-5" aria-label="Investimentos">
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
