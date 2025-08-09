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
  const [flat, setFlat] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
    if (error) throw error;
    setFlat(data as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => { list(); }, [list]);

  const create = async (payload: Partial<Category>) => {
    const { error } = await supabase.from("categories").insert(payload);
    if (error) throw error;
    await list();
  };

  return { flat, loading, list, create };
}