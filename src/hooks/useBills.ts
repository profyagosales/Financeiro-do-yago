import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { supabase } from '@/lib/supabaseClient';

export type Bill = {
  id: string;
  user_id: string;
  description: string;
  due_date: string; // YYYY-MM-DD
  amount: number;
  status: string;
  account_id?: string | null;
  category_id?: string | null;
  attachment_url?: string | null;
};

function monthBoundsISO(year?: number, month?: number) {
  const now = dayjs();
  const y = typeof year === 'number' ? year : now.year();
  const m = typeof month === 'number' ? month : now.month() + 1;
  const start = dayjs(`${y}-${String(m).padStart(2,'0')}-01`).startOf('month').format('YYYY-MM-DD');
  const end = dayjs(`${y}-${String(m).padStart(2,'0')}-01`).endOf('month').format('YYYY-MM-DD');
  return { start, end };
}

export function useBills(year?: number, month?: number) {
  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { start, end } = useMemo(() => monthBoundsISO(year, month), [year, month]);

  const list = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .gte('due_date', start)
        .lte('due_date', end)
        .order('due_date', { ascending: true });
      if (error) throw error;
      setData((data || []) as Bill[]);
    } catch (err) {
      console.error('[useBills] list', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    void list();
  }, [list]);

  const add = async (b: Omit<Bill, 'id' | 'user_id'>) => {
    const { error } = await supabase.from('bills').insert(b);
    if (error) throw error;
    await list();
  };

  const update = async (id: string, patch: Partial<Bill>) => {
    const { error } = await supabase.from('bills').update(patch).eq('id', id);
    if (error) throw error;
    await list();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) throw error;
    await list();
  };

  return { data, loading, list, add, update, remove, start, end };
}

export function useUpcomingBills(daysAhead = 10) {
  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    try {
      setLoading(true);
      const start = dayjs().format('YYYY-MM-DD');
      const end = dayjs().add(daysAhead, 'day').format('YYYY-MM-DD');
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('status', 'pending')
        .gte('due_date', start)
        .lte('due_date', end)
        .order('due_date', { ascending: true });
      if (error) throw error;
      setData((data || []) as Bill[]);
    } catch (err) {
      console.error('[useUpcomingBills] list', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [daysAhead]);

  useEffect(() => {
    void list();
  }, [list]);

  const update = async (id: string, patch: Partial<Bill>) => {
    const { error } = await supabase.from('bills').update(patch).eq('id', id);
    if (error) throw error;
    await list();
  };

  return { data, loading, list, update };
}
