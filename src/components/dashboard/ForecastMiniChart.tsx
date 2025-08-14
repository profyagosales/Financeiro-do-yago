import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

import { WidgetCard, WidgetHeader } from './WidgetCard';

import type { ForecastPoint } from '@/hooks/useForecast';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: ForecastPoint[];
  isLoading?: boolean;
}

export default function ForecastMiniChart({ data, isLoading }: Props) {
  return (
    <WidgetCard>
      <WidgetHeader title="Previsão 30 dias" subtitle="Próximos meses" />
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" hide />
              <YAxis hide />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="in" stroke="hsl(var(--chart-emerald))" fill="hsl(var(--chart-emerald)/0.2)" />
              <Area type="monotone" dataKey="out" stroke="hsl(var(--chart-rose))" fill="hsl(var(--chart-rose)/0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </WidgetCard>
  );
}
