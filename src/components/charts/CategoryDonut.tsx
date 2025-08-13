// src/components/charts/CategoryDonut.tsx
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { mapCategoryColor } from "@/lib/palette";
import type { UITransaction } from "@/components/TransactionsTable";
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { mapCategoryColor } from '@/lib/palette';
import type { UITransaction } from '@/components/TransactionsTable';

type Props = {
  transacoes?: UITransaction[];
  mes?: string;
  categoriesData?: Array<{ name: string; total: number }>;
};

export default function CategoryDonut({
  transacoes = [],
  categoriesData,
}: Props) {
  // soma por categoria (apenas despesas)
  const data = useMemo(() => {
    if (categoriesData) {
      return categoriesData.map((c) => ({ name: c.name, value: c.total }));
    }
    const byCat = transacoes
      .filter((t) => t.type === "expense")
      .reduce<Record<string, number>>((acc, t) => {
        const key = t.category || "Sem categoria";
        acc[key] = (acc[key] ?? 0) + t.value;
        return acc;
      }, {});

    return Object.entries(byCat)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categoriesData, transacoes]);

  if (!data.length) {
    return (
      <div className="rounded-xl border bg-white dark:bg-slate-900 p-4 h-[360px] flex items-center justify-center text-sm text-slate-500">
        Sem dados no período
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <h3 className="font-medium mb-3">Despesas por categoria</h3>
      <div className="h-[320px]">
        <ResponsiveContainer>
          <PieChart margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
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
                (Number(v) || 0).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
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
