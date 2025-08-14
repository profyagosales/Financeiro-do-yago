import { useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabaseClient';

export type Mile = {
  id: number;
  program: string;
  points: number;
  date: string;
  partner?: string | null;
  expires_at?: string | null;
  status?: string | null;
  expected_at?: string | null;
};

export function useMiles() {
  const [rows, setRows] = useState<Mile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('miles')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setRows((data as Mile[]) ?? []);
    } catch (e: any) {
      setError(e.message ?? String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchAll();
  }, []);

  const saldoTotal = useMemo(() => rows.reduce((s, r) => s + (r.points || 0), 0), [rows]);

  return { rows, loading, error, saldoTotal, refetch: fetchAll } as const;
}
