// src/components/charts/DailyBars.tsx
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts';
import dayjs from 'dayjs';

import { SERIES_COLORS } from '@/lib/palette';
import type { UITransaction } from '@/components/TransactionsTable';

type Props = { transacoes?: UITransaction[]; mes?: string };

export default function DailyBars({ transacoes = [], mes }: Props) {
  // cria série diária do mês: receitas e despesas
  const data = useMemo(() => {
    const month = mes ?? dayjs().format('YYYY-MM');
    const daysInMonth = dayjs(month + '-01').daysInMonth();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = dayjs(month + '-01').date(i + 1).format('YYYY-MM-DD');
      const receitas = transacoes
        .filter((t) => t.type === 'income' && t.date === d)
        .reduce((s, t) => s + t.value, 0);
      const despesas = transacoes
        .filter((t) => t.type === 'expense' && t.date === d)
        .reduce((s, t) => s + t.value, 0);
      return { dia: i + 1, receitas, despesas };
    });
  }, [transacoes, mes]);

  const hasData = data.some((d) => d.receitas || d.despesas);

  const brl = (v: number) =>
    (Number(v) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <h3 className="font-medium mb-3">Movimento diário</h3>
      <div className="h-[320px]">
        {hasData ? (
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
              <XAxis dataKey="dia" />
              <YAxis tickFormatter={brl} />
              <Tooltip formatter={(v: number) => brl(v)} labelFormatter={(l: number) => `Dia ${l}`} />
              <Legend />
              <Bar
                dataKey="despesas"
                name="Despesas"
                fill={SERIES_COLORS.expense}
                radius={[4, 4, 0, 0]}
              >
                <LabelList position="top" formatter={(v) => (v ? brl(Number(v)) : '')} />
              </Bar>
              <Bar
                dataKey="receitas"
                name="Receitas"
                fill={SERIES_COLORS.income}
                radius={[4, 4, 0, 0]}
              >
                <LabelList position="top" formatter={(v) => (v ? brl(Number(v)) : '')} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            Sem dados no período
          </div>
        )}
      </div>
    </div>
  );
}
