import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CreditCard } from "@/types/finance";

export type { CreditCard };

export function useCreditCards() {
  const [data, setData] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("credit_cards")
      .select("id,name,bank,limit_amount,cut_day,due_day,account_id")
      .order("name", { ascending: true });
    if (error) throw error;
    setData(data as CreditCard[]);
    setLoading(false);
  }, []);

  useEffect(() => { void list(); }, [list]);

  const create = async (payload: Omit<CreditCard, "id" | "user_id">) => {
    const { data, error } = await supabase
      .from("credit_cards")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    setData((d) => [...d, data as CreditCard]);
  };

  const update = async (id: string, changes: Partial<CreditCard>) => {
    const { data, error } = await supabase
      .from("credit_cards")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setData((d) => d.map((c) => (c.id === id ? (data as CreditCard) : c)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("credit_cards").delete().eq("id", id);
    if (error) throw error;
    setData((d) => d.filter((c) => c.id !== id));
  };

  return { data, loading, list, create, update, remove };
}

