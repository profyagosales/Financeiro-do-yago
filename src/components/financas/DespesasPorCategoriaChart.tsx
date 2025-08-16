import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils';

export type DespesaCategoria = {
  categoria: string;
  valor: number;
};

export type DespesasPorCategoriaChartProps = {
  data: DespesaCategoria[];
  onViewDetails: () => void;
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

export default function DespesasPorCategoriaChart({ data, onViewDetails }: DespesasPorCategoriaChartProps) {
  return (
  <div className="u-card-base p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">Despesas por categoria</h3>
        <button onClick={onViewDetails} className="text-sm text-emerald-700 hover:underline">
          Ver detalhes
        </button>
      </div>
      <div className="h-64">
        {data.length === 0 ? (
          <EmptyState title="Sem dados" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="valor"
                nameKey="categoria"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.categoria} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

