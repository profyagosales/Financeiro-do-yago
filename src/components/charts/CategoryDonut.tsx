// src/components/charts/CategoryDonut.tsx
import { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Heading } from '@/components/ui/Heading';
import type { UITransaction } from '@/components/TransactionsTable';
import { SkeletonLine } from '@/components/ui/SkeletonLine';
import { mapCategoryColor } from '@/lib/palette';

type Props = {
  transacoes?: UITransaction[];
  mes?: string;
  categoriesData?: Array<{ category: string; value: number }>;
  isLoading?: boolean;
};

export default function CategoryDonut({ transacoes = [], categoriesData, isLoading = false }: Props) {
  // soma por categoria (apenas despesas)
  const data = useMemo(() => {
    if (categoriesData) {
      return categoriesData.map((c) => ({ name: c.category, value: c.value }));
    }
    const byCat = transacoes
      .filter((t) => t.type === 'expense')
      .reduce<Record<string, number>>((acc, t) => {
        const key = t.category || 'Sem categoria';
        acc[key] = (acc[key] ?? 0) + t.value;
        return acc;
      }, {});

    return Object.entries(byCat).map(([name, value]) => ({ name, value }));
  }, [categoriesData, transacoes]);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white dark:bg-slate-900 p-4 h-[360px]">
        <SkeletonLine className="h-full w-full" />
      </div>
    );
  }

  if (!data.length) {
    return (
  <div className="rounded-xl border bg-white dark:bg-slate-900 p-4 h-[360px] flex items-center justify-center text-sm text-muted">
        Sem dados no período
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <Heading level={3}>Despesas por categoria</Heading>
      <div className="h-[320px]">
        <ResponsiveContainer>
          <PieChart margin={{ top: 12, right: 16, bottom: 12, left: 8 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              label={({ percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={mapCategoryColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) =>
                (Number(v) || 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              }
              labelFormatter={(name: string) => name}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
