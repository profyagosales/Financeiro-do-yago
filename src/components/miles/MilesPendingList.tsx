import dayjs from 'dayjs';
import { useMemo } from 'react';

import type { MilesProgram } from '@/components/miles/MilesHeader';

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
  const itens = useMemo(() => MOCK.filter((m) => !program || m.program === program), [program]);
  const colSpan = program ? 3 : 4;

  return (
    <div className="rounded-xl border bg-white p-4 dark:bg-slate-900">
      <h3 className="mb-3 font-medium">A receber</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
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
                {!program && <td className="py-2 capitalize">{m.program}</td>}
                <td className="py-2">{m.partner}</td>
                <td>{m.points}</td>
                <td>{dayjs(m.expected_at).format('DD/MM/YYYY')}</td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="py-10 text-center text-slate-500">
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
