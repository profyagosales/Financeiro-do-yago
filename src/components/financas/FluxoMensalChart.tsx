import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';

export type FluxoMensalPoint = {
  mes: string;
  valor: number;
};

export type FluxoMensalChartProps = {
  data: FluxoMensalPoint[];
  onViewDetails: () => void;
};

export default function FluxoMensalChart({ data, onViewDetails }: FluxoMensalChartProps) {
  return (
    <div className="card-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">Fluxo mensal</h3>
        <button onClick={onViewDetails} className="text-sm text-emerald-700 hover:underline">
          Ver detalhes
        </button>
      </div>
      <div className="h-64">
        {data.length === 0 ? (
          <EmptyState title="Sem dados" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(v) => formatCurrency(Number(v))} width={80} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

