import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { BRAND, type MilesProgram } from '@/components/MilesHeader';
import { supabase } from '@/lib/supabaseClient';

export type MilesPending = {
  id: string | number;
  program: MilesProgram;
  partner: string;
  points: number;
  expected_at: string; // YYYY-MM-DD
};

export default function MilesPendingList({ program }: { program?: MilesProgram }) {
  const [items, setItems] = useState<MilesPending[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();

      let query = supabase
        .from('miles')
        .select('id, program, amount, expected_at, transaction:transactions(description)')
        .eq('status', 'pending')
        .order('expected_at', { ascending: true });

      if (auth.user?.id) query = query.eq('user_id', auth.user.id);
      if (program) query = query.eq('program', program);

      const { data, error } = await query;
      if (!error && data && active) {
        const mapped: MilesPending[] = data.map((r: any) => ({
          id: r.id,
          program: r.program as MilesProgram,
          partner: r.transaction?.description || '',
          points: r.amount,
          expected_at: r.expected_at,
        }));
        setItems(mapped);
      } else if (error) {
        console.error(error);
        if (active) setItems([]);
      }
      if (active) setLoading(false);
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [program]);

  const colSpan = program ? 3 : 4;

  const totals = useMemo(() => {
    const t: Record<MilesProgram, number> = { livelo: 0, latampass: 0, azul: 0 };
    items.forEach((m) => {
      t[m.program] += m.points;
    });
    return t;
  }, [items]);

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
            {items.map((m) => (
              <tr key={m.id} className="border-t">
                {!program && <td className="py-2 capitalize">{BRAND[m.program].name}</td>}
                <td className="py-2">{m.partner}</td>
                <td>{m.points}</td>
                <td>{dayjs(m.expected_at).format('DD/MM/YYYY')}</td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={colSpan} className="py-10 text-center text-slate-500">
                  Sem pendências.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {items.length > 0 && (
        <div className="mt-3 text-right text-sm text-slate-600 dark:text-slate-400">
          {program ? (
            <div>
              {BRAND[program].name}: {totals[program].toLocaleString('pt-BR')} pts
            </div>
          ) : (
            (Object.keys(totals) as MilesProgram[]).map((p) =>
              totals[p] ? (
                <div key={p}>
                  {BRAND[p].name}: {totals[p].toLocaleString('pt-BR')} pts
                </div>
              ) : null,
            )
          )}
        </div>
      )}
    </div>
  );
}
