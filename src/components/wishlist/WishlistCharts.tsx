// src/components/wishlist/WishlistCharts.tsx
import { useMemo } from 'react';
import dayjs from 'dayjs';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { mapCategoryColor } from '@/lib/palette';
import type { WishlistItem, PricePoint } from '@/services/wishlistApi';
import { SkeletonLine } from '@/components/ui/SkeletonLine';

export type WishlistCategoryDonutProps = {
  items?: WishlistItem[];
  isLoading?: boolean;
};

export function WishlistCategoryDonut({ items = [], isLoading = false }: WishlistCategoryDonutProps) {
  const data = useMemo(() => {
    const byCat = items.reduce<Record<string, number>>((acc, item) => {
      const key = item.category || 'Sem categoria';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(byCat).map(([name, value]) => ({ name, value }));
  }, [items]);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white dark:bg-slate-900 p-4 h-[360px]">
        <SkeletonLine className="h-full w-full" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border bg-white dark:bg-slate-900 p-4 h-[360px] flex items-center justify-center text-sm text-slate-500">
        Sem itens
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <h3 className="font-medium mb-3">Itens por categoria</h3>
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
            <Tooltip formatter={(v: number) => v} labelFormatter={(name: string) => name} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export type WishlistPriceHistoryLineProps = {
  points?: PricePoint[];
  isLoading?: boolean;
  height?: number;
};

export function WishlistPriceHistoryLine({ points = [], isLoading = false, height = 320 }: WishlistPriceHistoryLineProps) {
  const data = useMemo(() => {
    return [...points]
      .sort((a, b) => new Date(a.created_at ?? '').getTime() - new Date(b.created_at ?? '').getTime())
      .map((p) => ({
        date: p.created_at ? dayjs(p.created_at).format('DD/MM') : '',
        price: p.price,
      }));
  }, [points]);

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <h3 className="font-medium mb-3">Histórico de preço</h3>
      <div style={{ height }}>
        {isLoading ? (
          <SkeletonLine className="h-full w-full" />
        ) : data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 16, bottom: 12, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(v) => `R$ ${v}`} />
              <Tooltip formatter={(v: number) => `R$ ${Number(v).toFixed(2)}`} />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--chart-blue))" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">Sem histórico</div>
        )}
      </div>
    </div>
  );
}
