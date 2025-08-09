import { Link } from 'react-router-dom';
import { usePeriod } from '@/state/periodFilter';
import FilterBar from '@/components/FilterBar';
import { useTransactions } from '@/hooks/useTransactions';
import { useTransactionsYear } from '@/hooks/useTransactionsYear';
import { PageHeader } from '@/components/PageHeader';
import { MotionCard } from '@/components/ui/MotionCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import DailyBars from '@/components/charts/DailyBars';
import MonthlyBars from '@/components/charts/MonthlyBars';
import CategoryDonut from '@/components/charts/CategoryDonut';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';

export default function Financas() {
  const period = usePeriod();
  const { mode, month, year } = period;

  const txHook = mode === 'monthly'
    ? useTransactions(year, month)
    : useTransactionsYear(year);

  const { data: transacoes, kpis, loading } = txHook;
  const mesStr = `${year}-${String(month).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finanças"
        subtitle="Resumo do período selecionado"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="secondary"><Link to="/financas/mensal">Mensal</Link></Button>
            <Button asChild variant="secondary"><Link to="/financas/anual">Anual</Link></Button>
          </div>
        }
      />

      <FilterBar />

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-600 text-white"><Coins size={18} /></div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-300">Saldo</span>
              <AnimatedNumber value={kpis.saldo} />
            </div>
          </div>
        </MotionCard>
        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-600 text-white"><TrendingUp size={18} /></div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-300">Entradas</span>
              <AnimatedNumber value={kpis.entradas} />
            </div>
          </div>
        </MotionCard>
        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-rose-500 text-white"><TrendingDown size={18} /></div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-300">Saídas</span>
              <AnimatedNumber value={-kpis.saidas} />
            </div>
          </div>
        </MotionCard>
      </section>

      {/* Gráficos */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {mode === 'monthly'
            ? <DailyBars transacoes={transacoes as any} mes={mesStr} />
            : <MonthlyBars transacoes={transacoes as any} />}
        </div>
        <div className="lg:col-span-1">
          <CategoryDonut transacoes={transacoes as any} />
        </div>
      </section>

      {loading && <p>Carregando…</p>}
    </div>
  );
}
