import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CreditCard, CreditCardSchema } from '@/types/finance';

export function useCreditCards() {
  const [data, setData] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    setData(data as CreditCard[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void list();
  }, [list]);

  const add = async (payload: Omit<CreditCard, 'id' | 'user_id'>) => {
    const parsed = CreditCardSchema.omit({ id: true, user_id: true }).parse(payload);
    const { data, error } = await supabase
      .from('credit_cards')
      .insert(parsed)
      .select()
      .single();
    if (error) throw error;
    setData((d) => [...d, data as CreditCard]);
  };

  const update = async (
    id: string,
    patch: Partial<Omit<CreditCard, 'id' | 'user_id'>>,
  ) => {
    const parsed = CreditCardSchema.omit({ id: true, user_id: true })
      .partial()
      .parse(patch);
    const { data, error } = await supabase
      .from('credit_cards')
      .update(parsed)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setData((d) => d.map((c) => (c.id === id ? (data as CreditCard) : c)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('credit_cards').delete().eq('id', id);
    if (error) throw error;
    setData((d) => d.filter((c) => c.id !== id));
  };

  return { data, loading, list, add, update, remove };
}
