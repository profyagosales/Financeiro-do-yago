import { formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Progress } from '@/components/ui/progress';

export type OrcamentoItem = {
  categoria: string;
  usado: number;
  limite: number;
};

export type OrcamentoProgressProps = {
  orcamentos: OrcamentoItem[];
  onViewDetails: () => void;
};

export default function OrcamentoProgress({ orcamentos, onViewDetails }: OrcamentoProgressProps) {
  return (
    <div className="card-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">Orçamento</h3>
        <button onClick={onViewDetails} className="text-sm text-emerald-700 hover:underline">
          Ver detalhes
        </button>
      </div>
      {orcamentos.length === 0 ? (
        <EmptyState title="Sem orçamento" />
      ) : (
        <ul className="space-y-4">
          {orcamentos.map((o) => {
            const percent = Math.min(100, (o.usado / o.limite) * 100);
            return (
              <li key={o.categoria}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{o.categoria}</span>
                  <span>
                    {formatCurrency(o.usado)} / {formatCurrency(o.limite)}
                  </span>
                </div>
                <Progress value={percent} className="h-2" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

