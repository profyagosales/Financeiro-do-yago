// src/components/home/ForecastChart.tsx
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import type { Transaction } from '@/hooks/useTransactions';
import { useForecast, forecastCashflowNext30 } from '@/hooks/useForecast';
import { formatCurrency } from '@/lib/utils';
import { SkeletonLine } from '@/components/ui/SkeletonLine';

export type ForecastChartProps = {
  transactions?: Transaction[];
  window?: number;
  isLoading?: boolean;
};

export default function ForecastChart({
  transactions = [],
  window = 7,
  isLoading = false,
}: ForecastChartProps) {
  const { data } = useForecast(transactions, window);
  const chartData = data?.length ? data : forecastCashflowNext30([], window);
  const hasData = chartData.length > 0;

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <h3 className="font-medium mb-3">Previsão de fluxo de caixa</h3>
      <div className="h-[320px]">
        {isLoading ? (
          <SkeletonLine className="h-full w-full" />
        ) : hasData ? (
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 12, right: 16, bottom: 12, left: 8 }}>
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(v) => formatCurrency(Number(v))} />
              <Tooltip
                formatter={(v: unknown) => formatCurrency(Number(v))}
                labelFormatter={(l: unknown) => `Dia ${l}`}
              />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            Sem dados
          </div>
        )}
      </div>
    </div>
  );
}

