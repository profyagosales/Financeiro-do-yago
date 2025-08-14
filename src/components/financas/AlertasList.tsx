import { EmptyState } from '@/components/ui/EmptyState';

export type Alerta = {
  id: string;
  mensagem: string;
};

export type AlertasListProps = {
  alertas: Alerta[];
  onViewDetails: () => void;
};

export default function AlertasList({ alertas, onViewDetails }: AlertasListProps) {
  return (
    <div className="card-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">Alertas</h3>
        <button onClick={onViewDetails} className="text-sm text-emerald-700 hover:underline">
          Ver detalhes
        </button>
      </div>
      {alertas.length === 0 ? (
        <EmptyState title="Sem alertas" />
      ) : (
        <ul className="list-disc pl-5 text-sm space-y-1">
          {alertas.map((a) => (
            <li key={a.id}>{a.mensagem}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

