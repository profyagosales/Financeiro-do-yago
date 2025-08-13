import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

export type Suggestion = {
  id: string;
  type: "carryover_balance" | "carryover_unpaid_bill";
  from_year: number; from_month: number;
  to_year: number; to_month: number;
  payload: any;
  accepted: boolean;
};

export function useSuggestions(year: number, month: number) {
  const [data, setData] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suggestions")
      .select("*")
      .eq("to_year", year)
      .eq("to_month", month)
      .eq("accepted", false)
      .order("created_at", { ascending: true });
    if (error) throw error;
    setData(data as Suggestion[]);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { list(); }, [list]);

  const generateFor = async (y: number, m: number) => {
    const { error } = await supabase.rpc("generate_month_close_suggestions", { _y: y, _m: m });
    if (error) throw error;
    await list();
  };

  const applyAll = async () => {
    // aplica cada sugestão (MVP): cria transação ou replica bill
    const nextY = year, nextM = month;
    for (const s of data) {
      if (s.type === "carryover_balance") {
        const { account_id, amount } = s.payload || {};
        if (account_id && amount && amount > 0) {
          await supabase.from("transactions").insert({
            date: new Date(nextY, nextM - 1, 1).toISOString(),
            description: "Saldo carregado do mês anterior",
            amount: Number(amount),
            account_id,
          });
        }
      } else if (s.type === "carryover_unpaid_bill") {
        const { description, amount, old_due } = s.payload || {};
        const newDue = new Date(nextY, nextM - 1, new Date(old_due).getDate());
        await supabase.from("bills").insert({
          description,
          amount,
          due_date: newDue.toISOString().slice(0, 10),
        });
      }
      await supabase.from("suggestions").update({ accepted: true }).eq("id", s.id);
    }
    await list();
  };

  const ignoreAll = async () => {
    const ids = data.map(d => d.id);
    if (ids.length) {
      await supabase.from("suggestions").update({ accepted: true }).in("id", ids);
      await list();
    }
  };

  return { data, loading, list, generateFor, applyAll, ignoreAll };
}