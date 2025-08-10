import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

import { useTransactionsYear } from '@/hooks/useTransactionsYear';
import { PageHeader } from '@/components/PageHeader';
import { MotionCard } from '@/components/ui/MotionCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import MonthlyBars from '@/components/charts/MonthlyBars';
import CategoryDonut from '@/components/charts/CategoryDonut';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ANOS: number[] = (() => {
  const y = new Date().getFullYear();
  const arr: number[] = [];
  for (let i = y + 1; i >= y - 6; i--) arr.push(i);
  return arr;
})();

dayjs.locale('pt-br');

export default function FinancasAnual() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const { data, loading } = useTransactionsYear(ano);

  const mensal = useMemo(() => {
    const base = Array.from({ length: 12 }, (_, i) => ({
      mes: i,
      entradas: 0,
      saidas: 0,
      saldo: 0,
    }));
    data.forEach((t) => {
      const m = dayjs(t.date).month();
      if (t.amount > 0) base[m].entradas += t.amount;
      else base[m].saidas += Math.abs(t.amount);
    });
    base.forEach((b) => {
      b.saldo = b.entradas - b.saidas;
    });
    return base;
  }, [data]);

  const categorias = useMemo(() => {
    const map = new Map<string, number>();
    data
      .filter((t) => t.amount < 0)
      .forEach((t) => {
        const cat = (t as any).category || 'Outros';
        map.set(cat, (map.get(cat) || 0) + Math.abs(t.amount));
      });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [data]);

  return (
    <div className="space-y-6">
      <PageHeader title="Finanças Anual" subtitle="Visão consolidada por ano" />

      <div className="flex flex-wrap gap-4">
        <div className="min-w-[160px]">
          <span className="mb-1 block text-xs text-emerald-100/90">Ano</span>
          <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {ANOS.map((a) => (
                <SelectItem key={a} value={String(a)}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards por mês */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mensal.map((m) => (
          <MotionCard key={m.mes} className="space-y-2">
            <h3 className="text-sm font-medium">
              {dayjs().month(m.mes).format('MMMM')}
            </h3>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-300">Entradas</span>
                <AnimatedNumber value={m.entradas} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-300">Saídas</span>
                <AnimatedNumber value={-m.saidas} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-300">Saldo</span>
                <AnimatedNumber value={m.saldo} />
              </div>
            </div>
          </MotionCard>
        ))}
      </section>

      {/* Gráficos */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyBars transacoes={data} />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonut transacoes={data as any} />
        </div>
      </section>

      {/* Tabela de categorias */}
      <section className="rounded-xl border bg-white dark:bg-slate-900 p-4">
        <h3 className="font-medium mb-3">Despesas por categoria</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Categoria</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(([cat, val]) => (
                <tr key={cat} className="border-t">
                  <td className="py-1">{cat}</td>
                  <td className="py-1 text-right">
                    {val.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {loading && <p>Carregando…</p>}
    </div>
  );
}

