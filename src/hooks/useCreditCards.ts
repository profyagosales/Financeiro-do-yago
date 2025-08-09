import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type CreditCard = {
  id: string;
  name: string;
  brand: string | null;
  limit_value: number;
  closing_day: number;
  due_day: number;
  account_id: string;
};

export function useCreditCards() {
  const [data, setData] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("credit_cards")
      .select("id,name,brand,limit_value,closing_day,due_day,account_id")
      .order("name", { ascending: true });
    if (error) throw error;
    setData(data as CreditCard[]);
    setLoading(false);
  }, []);

  useEffect(() => { list(); }, [list]);

  const create = async (payload: Partial<CreditCard>) => {
    const { error } = await supabase.from("credit_cards").insert(payload);
    if (error) throw error;
    await list();
  };

  const update = async (id: string, patch: Partial<CreditCard>) => {
    const { error } = await supabase
      .from("credit_cards")
      .update(patch)
      .eq("id", id);
    if (error) throw error;
    await list();
  };

  const remove = async (id: string) => {
    const { error } = await supabase
      .from("credit_cards")
      .delete()
      .eq("id", id);
    if (error) throw error;
    await list();
  };

  return { data, loading, list, create, update, remove };
}