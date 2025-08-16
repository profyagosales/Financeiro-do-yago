import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils';

export type EntradasVsSaidasPoint = {
  mes: string;
  entradas: number;
  saidas: number;
};

export type EntradasVsSaidasChartProps = {
  data: EntradasVsSaidasPoint[];
  onViewDetails: () => void;
};

export default function EntradasVsSaidasChart({ data, onViewDetails }: EntradasVsSaidasChartProps) {
  return (
  <div className="u-card-base p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">Entradas vs Saídas</h3>
        <button onClick={onViewDetails} className="text-sm text-emerald-700 hover:underline">
          Ver detalhes
        </button>
      </div>
      <div className="h-64">
        {data.length === 0 ? (
          <EmptyState title="Sem dados" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(v) => formatCurrency(Number(v))} width={80} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="entradas" fill="#10b981" />
              <Bar dataKey="saidas" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

