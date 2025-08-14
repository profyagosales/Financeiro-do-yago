import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from 'recharts';

import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import type { ForecastPoint } from '@/hooks/useForecast';

export type ForecastMiniChartProps = {
  data: ForecastPoint[];
  isLoading?: boolean;
};

export default function ForecastMiniChart({ data, isLoading }: ForecastMiniChartProps) {
  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }
  return (
    <div className="h-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <XAxis dataKey="day" hide />
          <YAxis hide />
          <Tooltip formatter={(v: number) => formatCurrency(Number(v))} labelFormatter={(l) => `Dia ${l}`} />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

