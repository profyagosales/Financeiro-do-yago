import { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import WidgetCard from './WidgetCard';

import { formatCurrency } from '@/lib/utils';

interface ForecastChartProps {
  data: { month: string; in: number; out: number }[];
  onClick?: () => void;
}

export default function ForecastChart({ data, ...rest }: ForecastChartProps) {
  const chartData = useMemo(() => {
    let acc = 0;
    return data.map((d) => {
      acc += d.in - d.out;
      return { ...d, saldo: acc };
    });
  }, [data]);

  return (
    <WidgetCard title="Fluxo de caixa" {...rest}>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v: unknown) => formatCurrency(Number(v))} wrapperStyle={{ outline: 'none' }} />
            <Bar dataKey="in" fill="hsl(var(--chart-blue))" radius={[4,4,0,0]} />
            <Bar dataKey="out" fill="hsl(var(--chart-rose))" radius={[4,4,0,0]} />
            <Area dataKey="saldo" type="monotone" stroke="hsl(var(--chart-emerald))" fill="hsl(var(--chart-emerald)/.2)" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
