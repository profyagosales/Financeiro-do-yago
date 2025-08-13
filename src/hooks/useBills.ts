import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";
import { buildSingleEvent } from "@/lib/ics";

export type Bill = {
  id: string;
  description: string;
  amount: number;
  due_date: string; // YYYY-MM-DD
  status: "open" | "paid" | "overdue";
  pdf_url?: string | null;
  pix_key?: string | null;
};

type Filters = {
  month: number;
  year: number;
  status?: Bill["status"];
};

export function useBills({ month, year, status }: Filters) {
  const [data, setData] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    const q = supabase
      .from("bills")
      .select("*")
      .gte("due_date", start)
      .lte("due_date", end)
      .order("due_date", { ascending: true });
    const { data: rows, error } = await q;
    if (error) {
      setError(error.message);
      setData([]);
      setLoading(false);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    let bills = (rows as Bill[]).map((b) =>
      b.status !== "paid" && b.due_date < today ? { ...b, status: "overdue" } : b
    );
    if (status) bills = bills.filter((b) => b.status === status);
    setData(bills);
    setLoading(false);
  }, [month, year, status]);

  useEffect(() => {
    void list();
  }, [list]);

  const create = useCallback(
    async (payload: Omit<Bill, "id" | "status"> & { status?: Bill["status"] }) => {
      const base = { ...payload, status: payload.status ?? "open" };
      const { data: row, error } = await supabase
        .from("bills")
        .insert(base)
        .select("*")
        .single();
      if (error) throw error;
      setData((d) => [...d, row as Bill]);
      return row as Bill;
    },
    []
  );

  const update = useCallback(async (id: string, patch: Partial<Omit<Bill, "id">>) => {
    const { data: row, error } = await supabase
      .from("bills")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    setData((d) => d.map((b) => (b.id === id ? (row as Bill) : b)));
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("bills").delete().eq("id", id);
    if (error) throw error;
    setData((d) => d.filter((b) => b.id !== id));
  }, []);

  const markPaid = useCallback(
    async (id: string) => {
      await update(id, { status: "paid" });
    },
    [update]
  );

  const toIcs = useCallback((bill: Bill) => {
    const ics = buildSingleEvent({
      title: bill.description,
      description: `Valor: R$ ${bill.amount.toFixed(2)}`,
      start: bill.due_date,
      end: bill.due_date,
    });
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bill.description}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return { data, loading, error, create, update, remove, markPaid, toIcs, refetch: list };
}
