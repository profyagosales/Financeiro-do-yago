import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SERIES_COLORS } from '@/lib/palette';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

type Tx = { date: string; amount: number };

export default function MonthlyBars({ transacoes }: { transacoes: Tx[] }) {
  const data = MESES.map((m, idx) => {
    const receitas = transacoes
      .filter(t => new Date(t.date).getMonth() === idx && t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);
    const despesas = transacoes
      .filter(t => new Date(t.date).getMonth() === idx && t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { mes: m, receitas, despesas };
  });

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <h3 className="font-medium mb-3">Movimento mensal</h3>
      <div className="h-[320px]">
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="mes" />
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
