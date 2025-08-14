import { formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';

export type Lancamento = {
  id: string;
  descricao: string;
  data: string;
  valor: number;
};

export type LancamentosRecentesTableProps = {
  lancamentos: Lancamento[];
  onViewDetails: () => void;
};

export default function LancamentosRecentesTable({ lancamentos, onViewDetails }: LancamentosRecentesTableProps) {
  return (
    <div className="card-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">Lançamentos recentes</h3>
        <button onClick={onViewDetails} className="text-sm text-emerald-700 hover:underline">
          Ver detalhes
        </button>
      </div>
      {lancamentos.length === 0 ? (
        <EmptyState title="Sem lançamentos" />
      ) : (
        <div className="overflow-x-auto">
          <ul className="flex gap-4">
            {lancamentos.map((l) => (
              <li key={l.id} className="min-w-[14rem] rounded-md border p-3 text-sm">
                <div className="mb-1 font-medium">{l.descricao}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(l.data).toLocaleDateString('pt-BR')}
                </div>
                <div className="mt-1 text-right font-medium">
                  {formatCurrency(l.valor)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

