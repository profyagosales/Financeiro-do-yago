import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  kind: "expense" | "income" | "transfer";
  color: string | null;
  icon_key: string | null;
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    setCategories(data as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    list();
  }, [list]);

  const create = async (payload: Partial<Category>) => {
    const { error } = await supabase.from("categories").insert(payload);
    if (error) throw error;
    await list();
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