import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Transaction } from './useTransactions';

export function useTransactionsYear(year?: any) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const y = useMemo(() => {
    const n = Number(year);
    return Number.isInteger(n) && n >= 1970 && n <= 9999 ? n : new Date().getFullYear();
  }, [year]);

  const start = `${y}-01-01`;
  const end = `${y}-12-31`;

  const list = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true });
      if (error) throw error;
      setData((data || []) as Transaction[]);
    } catch (e: any) {
      console.error('[useTransactionsYear] list error:', e);
      setError(e?.message || 'Erro ao listar');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    void list();
  }, [list]);

  const create = async (t: Omit<Transaction, 'id'>) => {
    const { error } = await supabase.from('transactions').insert(t as any);
    if (error) throw error;
    await list();
  };

  const bulkCreate = async (rows: Omit<Transaction, 'id'>[]) => {
    const { error } = await supabase.from('transactions').insert(rows as any);
    if (error) throw error;
    await list();
  };

  const update = async (id: number, patch: Partial<Transaction>) => {
    const { error } = await supabase.from('transactions').update(patch).eq('id', id);
    if (error) throw error;
    await list();
  };

  const remove = async (id: number) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    await list();
  };

  const kpis = useMemo(() => {
    const entradas = data.filter(d => d.amount > 0).reduce((s, d) => s + d.amount, 0);
    const saidas = data.filter(d => d.amount < 0).reduce((s, d) => s + d.amount, 0);
    return {
      entradas,
      saidas: Math.abs(saidas),
      saldo: entradas + saidas,
    };
  }, [data]);

  const add = create;
  return { data, loading, error, list, create, add, bulkCreate, update, remove, kpis, start, end, year: y };
}
