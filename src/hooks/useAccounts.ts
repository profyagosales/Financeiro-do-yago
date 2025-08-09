import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Account, AccountSchema } from '@/types/finance';

export function useAccounts() {
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    setData(data as Account[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void list();
  }, [list]);

  const add = async (payload: Omit<Account, 'id' | 'user_id'>) => {
    const parsed = AccountSchema.omit({ id: true, user_id: true }).parse(payload);
    const { data, error } = await supabase
      .from('accounts')
      .insert(parsed)
      .select()
      .single();
    if (error) throw error;
    setData((d) => [...d, data as Account]);
  };

  const update = async (id: string, patch: Partial<Omit<Account, 'id' | 'user_id'>>) => {
    const parsed = AccountSchema.omit({ id: true, user_id: true })
      .partial()
      .parse(patch);
    const { data, error } = await supabase
      .from('accounts')
      .update(parsed)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setData((d) => d.map((a) => (a.id === id ? (data as Account) : a)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
    setData((d) => d.filter((a) => a.id !== id));
  };

  return { data, loading, list, add, update, remove };
}
