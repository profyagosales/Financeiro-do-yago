// src/hooks/makeCrudHook.ts
import { useEffect, useState, useCallback } from 'react';

import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export function makeCrudHook<T extends { id: number }>(table: string) {
  return function useCrud(filter: Record<string, unknown> = {}) {
    const { user } = useAuth();
    const [data, setData]     = useState<T[]>([]);
    const [loading, setLoad ] = useState(true);
    const [error, setError  ] = useState<string | null>(null);

    /* LISTAR -------------------------------------------------- */
    const fetchAll = useCallback(async () => {
      if (!user) return;
      setLoad(true);
      let q = supabase.from(table).select('*').eq('user_id', user);
      Object.entries(filter).forEach(([k, v]) => v && (q = q.eq(k, v)));
      const { data: rows, error } = await q;
      if (error) setError(error.message); else setData(rows as T[]);
      setLoad(false);
    }, [user, filter]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* ADICIONAR ---------------------------------------------- */
    const add = async (row: Omit<T, 'id' | 'user_id'>) => {
      if (!user) return;
      const { data: r, error } = await supabase
        .from(table)
        .insert({ ...row, user_id: user })
        .select()
        .single();
      if (error) throw error;
      setData(d => [...d, r as T]);
    };

    /* EDITAR -------------------------------------------------- */
    const update = async (id: number, changes: Partial<T>) => {
      const { data: r, error } = await supabase
        .from(table)
        .update(changes)
        .eq('id', id)
        .eq('user_id', user)
        .select()
        .single();
      if (error) throw error;
      setData(d => d.map(t => (t.id === id ? (r as T) : t)));
    };

    /* EXCLUIR ------------------------------------------------- */
    const remove = async (id: number) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', user);
      if (error) throw error;
      setData(d => d.filter(t => t.id !== id));
    };

    return { data, loading, error, add, update, remove, refetch: fetchAll };
  };
}