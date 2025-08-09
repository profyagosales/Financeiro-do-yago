import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Transaction = {
  id: number; // bigint
  date: string; // "YYYY-MM-DD"
  description: string;
  amount: number; // <0 despesa, >0 receita
  category_id?: string | null;
  account_id?: string | null;
  card_id?: string | null;
  installment_no?: number | null;
  installment_total?: number | null;
  parent_installment_id?: number | null;
};

// Helpers seguros contra timezone/inputs inválidos
function coercePeriod(year?: any, month?: any) {
  const now = new Date();
  let y = Number(year);
  let m = Number(month);
  if (!Number.isInteger(y) || y < 1970 || y > 9999) y = now.getFullYear();
  if (!Number.isInteger(m) || m < 1 || m > 12) m = now.getMonth() + 1;
  return { y, m };
}
function isoDateUTC(y: number, mZeroBased: number, day: number) {
  const d = new Date(Date.UTC(y, mZeroBased, day));
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
function monthBoundsISO(year?: any, month?: any) {
  const { y, m } = coercePeriod(year, month);
  const start = isoDateUTC(y, m - 1, 1);
  const end = isoDateUTC(y, m, 0); // dia 0 do mês seguinte = último dia do mês
  return { y, m, start, end };
}

export function useTransactions(year?: any, month?: any) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const { y, m, start, end } = useMemo(() => monthBoundsISO(year, month), [year, month]);

  const list = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true });
      if (error) throw error;
      setData((data || []) as Transaction[]);
    } catch (e) {
      console.error("[useTransactions] list error:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    if (!start || !end) return; // evita rodar com datas inválidas
    void list();
  }, [list, start, end]);

  const create = async (t: Omit<Transaction, "id">) => {
    const { error } = await supabase.from("transactions").insert(t as any);
    if (error) throw error;
    await list();
  };

  const bulkCreate = async (rows: Omit<Transaction, "id">[]) => {
    const { error } = await supabase.from("transactions").insert(rows as any);
    if (error) throw error;
    await list();
  };

  const update = async (id: number, patch: Partial<Transaction>) => {
    const { error } = await supabase.from("transactions").update(patch).eq("id", id);
    if (error) throw error;
    await list();
  };

  const remove = async (id: number) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
    await list();
  };

  const kpis = useMemo(() => {
    const entradas = data.filter(d => d.amount > 0).reduce((s, d) => s + d.amount, 0);
    const saidas = data.filter(d => d.amount < 0).reduce((s, d) => s + d.amount, 0);
    return {
      entradas,
      saidas: Math.abs(saidas),
      saldo: entradas + saidas,
    };
  }, [data]);

  const add = create;
  return { data, loading, list, create, add, bulkCreate, update, remove, kpis, start, end, year: y, month: m };
}