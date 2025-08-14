import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

import { Card } from '@/components/ui/card';
import type { UITransaction } from '@/components/TransactionsTable';
import { formatCurrency } from '@/lib/utils';
import { forecastCashflowNext30 } from '@/hooks/useForecast';

// Wrapper to comply with forecast.forecast30d API
const forecast = { forecast30d: forecastCashflowNext30 };

type Props = { transacoes?: UITransaction[] };

export default function ForecastCard({ transacoes = [] }: Props) {
  const hasData = transacoes.length >= 7;

  const data = useMemo(() => {
    if (!hasData) return [];
    const tx = transacoes.map((t) => ({
      id: t.id,
      date: t.date,
      amount: t.value * (t.type === 'income' ? 1 : -1),
      description: t.description,
    }));
    return forecast.forecast30d(tx, 7);
  }, [transacoes, hasData]);

  const total = useMemo(() => data.reduce((s, p) => s + p.value, 0), [data]);

  return (
    <Card className="p-4 space-y-4" aria-label="Previsão de fluxo de caixa para os próximos 30 dias">
      <p className="text-sm font-medium">
        Próximos 30d estimados: {hasData ? formatCurrency(total) : '—'}
      </p>
      {hasData ? (
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-emerald))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--chart-emerald))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                labelFormatter={(l: number) => `Dia ${l}`}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--chart-tooltip-bg))',
                  color: 'hsl(var(--chart-tooltip-fg))',
                }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-emerald))"
                fill="url(#forecastArea)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
          Dados insuficientes
        </div>
      )}
    </Card>
  );
}

