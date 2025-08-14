import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import type { MilesProgram } from '@/components/miles/MilesHeader';
import { supabase } from '@/lib/supabaseClient';

export type MilesPending = {
  id: number;
  program: MilesProgram;
  partner?: string | null;
  points: number;
  expected_at: string; // YYYY-MM-DD
};

export default function MilesPendingList({ program }: { program?: MilesProgram }) {
  const [itens, setItens] = useState<MilesPending[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let q = supabase
        .from('miles')
        .select('id, program, amount, expected_at, transaction:transactions(description)')
        .eq('status', 'pending')
        .order('expected_at', { ascending: true });
      if (program) q = q.eq('program', program);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) {
        console.error(error);
        setItens([]);
        return;
      }
      const rows = (data ?? []).map((m: any) => ({
        id: m.id,
        program: m.program as MilesProgram,
        partner: m.transaction?.description ?? null,
        points: m.amount,
        expected_at: m.expected_at,
      }));
      setItens(rows);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [program]);

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
                <td className="py-2">{m.partner ?? '-'}</td>
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

