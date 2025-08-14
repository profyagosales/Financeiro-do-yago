import { formatCurrency } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';

export type ContaPagar = {
  nome: string;
  vencimento: string;
  valor: number;
};

export type ProximasContasListProps = {
  contas: ContaPagar[];
  onViewDetails: () => void;
};

export default function ProximasContasList({ contas, onViewDetails }: ProximasContasListProps) {
  return (
    <div className="card-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">Próximas contas</h3>
        <button onClick={onViewDetails} className="text-sm text-emerald-700 hover:underline">
          Ver detalhes
        </button>
      </div>
      {contas.length === 0 ? (
        <EmptyState title="Nenhuma conta" />
      ) : (
        <ul className="divide-y divide-zinc-100/60 dark:divide-zinc-800/60 text-sm">
          {contas.map((c) => (
            <li key={c.nome + c.vencimento} className="flex items-center justify-between py-2">
              <span className="truncate">{c.nome}</span>
              <span>{new Date(c.vencimento).toLocaleDateString('pt-BR')}</span>
              <span className="font-medium">{formatCurrency(c.valor)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

