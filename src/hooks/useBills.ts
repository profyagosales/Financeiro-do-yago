import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Bill = {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  paid: boolean;
  account_id: string | null;
  card_id: string | null;
  category_id: string | null;
};

export function useBills(year: number, month: number) {
  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .gte("due_date", start)
      .lte("due_date", end)
      .order("due_date", { ascending: true });
    if (error) throw error;
    setData(data as Bill[]);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { list(); }, [list]);

  const markPaid = async (id: string) => {
    const { error } = await supabase.from("bills").update({ paid: true, paid_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    await list();
  };

  return { data, loading, list, markPaid };
}