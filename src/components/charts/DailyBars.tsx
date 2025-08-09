// src/components/charts/DailyBars.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import dayjs from 'dayjs';
import { SERIES_COLORS } from '@/lib/palette';

type Tx = {
  date: string; value: number; type: 'income' | 'expense';
};

export default function DailyBars({ transacoes, mes }: { transacoes: Tx[]; mes: string }) {
  // cria série diária do mês: receitas e despesas
  const daysInMonth = dayjs(mes + '-01').daysInMonth();
  const data = Array.from({ length: daysInMonth }, (_, i) => {
    const d = dayjs(mes + '-01').date(i + 1).format('YYYY-MM-DD');
    const receitas = transacoes.filter(t => t.type === 'income' && t.date === d).reduce((s, t) => s + t.value, 0);
    const despesas = transacoes.filter(t => t.type === 'expense' && t.date === d).reduce((s, t) => s + t.value, 0);
    return { dia: i + 1, receitas, despesas };
  });

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <h3 className="font-medium mb-3">Movimento diário</h3>
      <div className="h-[320px]">
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`} />
            <Legend />
            <Bar dataKey="despesas" name="Despesas" fill={SERIES_COLORS.expense} />
            <Bar dataKey="receitas" name="Receitas" fill={SERIES_COLORS.income} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}