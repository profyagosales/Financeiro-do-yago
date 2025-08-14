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
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">Descrição</th>
                <th className="py-2">Data</th>
                <th className="py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => (
                <tr key={l.id} className="border-t border-zinc-100/60 dark:border-zinc-800/60">
                  <td className="py-2">{l.descricao}</td>
                  <td className="py-2">{new Date(l.data).toLocaleDateString('pt-BR')}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(l.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

