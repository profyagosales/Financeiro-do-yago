import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type CreditCard = {
  id: string;
  name: string;
  bank: string | null;
  limit_amount: number | null;
  cut_day: number | null;
  due_day: number | null;
  account_id: string | null;
};

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

  useEffect(() => { list(); }, [list]);

  return { data, loading, list };
}