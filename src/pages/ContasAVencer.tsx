import { useUpcomingBills } from '@/hooks/useBills';
import { PageHeader } from '@/components/PageHeader';

const brl = (n: number) =>
  (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ContasAVencer() {
  const { data: contas, loading } = useUpcomingBills();

  return (
    <div className="space-y-6">
      <PageHeader title="Contas a vencer" subtitle="Próximos 10 dias" />
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul className="divide-y divide-zinc-100/60 dark:divide-zinc-800/60">
          {contas.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.description}</div>
                <div className="text-xs text-muted-foreground">
                  vence em {new Date(c.due_date).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="ml-auto font-medium">{brl(c.amount)}</div>
            </li>
          ))}
          {contas.length === 0 && (
            <li className="py-4 text-sm text-muted-foreground">Nenhuma conta para os próximos dias.</li>
          )}
        </ul>
      )}
    </div>
  );
}
