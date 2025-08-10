import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Category } from "@/types/finance";

export type { Category };

export function useCategories() {
  const [flat, setFlat] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    setFlat(data as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => { void list(); }, [list]);

  const create = async (payload: Omit<Category, "id" | "user_id">) => {
    const { data, error } = await supabase
      .from("categories")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    setFlat((d) => [...d, data as Category]);
  };

  const update = async (id: string, changes: Partial<Category>) => {
    const { data, error } = await supabase
      .from("categories")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setFlat((d) => d.map((c) => (c.id === id ? (data as Category) : c)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    setFlat((d) => d.filter((c) => c.id !== id));
  };

  return { flat, loading, list, create, update, remove };
}

