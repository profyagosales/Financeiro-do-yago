// src/components/charts/DailyBars.tsx
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList } from 'recharts';
import dayjs from 'dayjs';
import { SERIES_COLORS } from '@/lib/palette';

type Tx = {
  date: string; value: number; type: 'income' | 'expense';
};

interface Props {
  transacoes: Tx[];
  mes: string;
}

export default function DailyBars({ transacoes, mes }: Props) {
  // cria série diária do mês: receitas e despesas
  const data = useMemo(() => {
    const daysInMonth = dayjs(mes + '-01').daysInMonth();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = dayjs(mes + '-01').date(i + 1).format('YYYY-MM-DD');
      const receitas = transacoes
        .filter(t => t.type === 'income' && t.date === d)
        .reduce((s, t) => s + t.value, 0);
      const despesas = transacoes
        .filter(t => t.type === 'expense' && t.date === d)
        .reduce((s, t) => s + t.value, 0);
      return { dia: i + 1, receitas, despesas };
    });
  }, [transacoes, mes]);

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <h3 className="font-medium mb-3">Movimento diário</h3>
      <div className="h-[320px]">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 0, left: 20 }}>
            <XAxis dataKey="dia" />
            <YAxis tickFormatter={(v: number) => `R$ ${v}`} />
            <Tooltip
              formatter={(v: number) => `R$ ${v.toFixed(2)}`}
              labelFormatter={(l: number) => `Dia ${l}`}
            />
            <Legend />
            <Bar
              dataKey="despesas"
              name="Despesas"
              fill={SERIES_COLORS.expense}
              radius={[4, 4, 0, 0]}
            >
              <LabelList position="top" formatter={(v: number) => (v ? `R$ ${v}` : '')} />
            </Bar>
            <Bar
              dataKey="receitas"
              name="Receitas"
              fill={SERIES_COLORS.income}
              radius={[4, 4, 0, 0]}
            >
              <LabelList position="top" formatter={(v: number) => (v ? `R$ ${v}` : '')} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
