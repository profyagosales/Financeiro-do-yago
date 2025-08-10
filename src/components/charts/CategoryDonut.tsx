// src/components/charts/CategoryDonut.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { colorForCategory } from '@/lib/palette';

type Tx = {
  id: number; date: string; description: string; value: number;
  type: 'income' | 'expense'; category: string;
};

function CategoryDonut({ transacoes }: { transacoes: Tx[] }) {
  // soma por categoria (apenas despesas)
  const byCat = transacoes
    .filter(t => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.value;
      return acc;
    }, {});

  const data = Object.entries(byCat).map(([name, value]) => ({ name, value }));

  if (!data.length) {
    return (
      <div className="rounded-xl border bg-white dark:bg-slate-900 p-4 h-[360px] flex items-center justify-center text-sm text-slate-500">
        Sem despesas no período.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <h3 className="font-medium mb-3">Despesas por categoria</h3>
      <div className="h-[320px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={colorForCategory(entry.name)} />
              ))}
            </Pie>
            <Tooltip formatter={(v: any) => `R$ ${Number(v).toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { CategoryDonut };