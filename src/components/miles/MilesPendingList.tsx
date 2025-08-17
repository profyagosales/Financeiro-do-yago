import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import BRANDS, { type MilesProgram } from '@/components/miles/brandConfig';
import Heading from '@/components/ui/Heading';
import { useAuth } from '@/contexts/AuthContext';

export type MilesPending = {
  id: string;
  program: MilesProgram;
  partner: string;
  points: number;
  expected_at: string; // YYYY-MM-DD
};

// Dados mockados; integração futura com backend/Supabase
const MOCK: MilesPending[] = [
  {
    id: '1',
    program: 'livelo',
    partner: 'Compra Loja X',
    points: 500,
    expected_at: dayjs().add(10, 'day').format('YYYY-MM-DD'),
  },
  {
    id: '2',
    program: 'latampass',
    partner: 'Cartão de crédito',
    points: 1000,
    expected_at: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  },
  {
    id: '3',
    program: 'azul',
    partner: 'Hotel',
    points: 800,
    expected_at: dayjs().add(20, 'day').format('YYYY-MM-DD'),
  },
];

export default function MilesPendingList({ program }: { program?: MilesProgram }) {
  const { user } = useAuth();
  const [itens, setItens] = useState<MilesPending[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user?.id) {
      setLoading(false);
      setItens([]);
      return;
    }

    setItens(MOCK.filter((m) => !program || m.program === program));
    setLoading(false);
  }, [user?.id, program]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  if (!user?.id && !loading) {
    return (
      <div className="rounded-xl border bg-white p-4 dark:bg-slate-900">
        <Heading level={3}>A receber</Heading>
  <div className="py-10 text-center text-muted">
          Faça login para ver as pendências.
        </div>
      </div>
    );
  }

  const colSpan = program ? 3 : 4;

  return (
    <div className="rounded-xl border bg-white p-4 dark:bg-slate-900">
      <Heading level={3}>A receber</Heading>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              {!program && <th className="py-2">Programa</th>}
              <th className="py-2">Origem</th>
              <th>Pontos</th>
              <th>Previsto</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((m) => (
              <tr key={m.id} className="border-t">
                {!program && <td className="py-2">{BRANDS[m.program].label}</td>}
                <td className="py-2">{m.partner}</td>
                <td>{m.points}</td>
                <td>{dayjs(m.expected_at).format('DD/MM/YYYY')}</td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="py-10 text-center text-muted">
                  Sem pendências.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
