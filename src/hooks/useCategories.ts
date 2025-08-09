import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Category, CategorySchema } from '@/types/finance';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    setCategories(data as Category[]);
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    setData(data as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    list();
  }, [list]);
    void list();
  }, [list]);

  const add = async (payload: Omit<Category, 'id' | 'user_id'>) => {
    const parsed = CategorySchema.omit({ id: true, user_id: true }).parse(payload);
    const { data, error } = await supabase
      .from('categories')
      .insert(parsed)
      .select()
      .single();
    if (error) throw error;
    setData((d) => [...d, data as Category]);
  };

  const update = async (
    id: string,
    patch: Partial<Omit<Category, 'id' | 'user_id'>>,
  ) => {
    const parsed = CategorySchema.omit({ id: true, user_id: true })
      .partial()
      .parse(patch);
    const { data, error } = await supabase
      .from('categories')
      .update(parsed)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setData((d) => d.map((c) => (c.id === id ? (data as Category) : c)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    setData((d) => d.filter((c) => c.id !== id));
  };

  const update = async (id: string, changes: Partial<Category>) => {
    const { error } = await supabase
      .from("categories")
      .update(changes)
      .eq("id", id);
    if (error) throw error;
    await list();
  };

  const remove = async (id: string) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
    await list();
  };

  return { categories, loading, list, create, update, remove };
}

  return { data, loading, list, add, update, remove };
}
