import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

export type CreditCard = {
  id: string;
  name: string;
  brand?: "visa" | "mastercard" | "elo" | "amex" | "hipercard" | string | null;
  limit_amount?: number | null;
  last4?: string | null;
  color?: string | null;
  created_at?: string;
  // campos legados ainda usados
  bank?: string | null;
  cut_day?: number | null;
  due_day?: number | null;
  account_id?: string | null;
};

// ------- helpers internos -------
function clampDay(n: unknown): number | null {
  if (n === null || n === undefined) return null;
  const v = Math.max(1, Math.min(31, Number(n)));
  return Number.isFinite(v) ? v : null;
}

function sanitize(payload: Partial<CreditCard>) {
  const p: Partial<CreditCard> = { ...payload };
  if (typeof p.name === "string") p.name = p.name.trim();
  if (p.cut_day !== undefined) p.cut_day = clampDay(p.cut_day);
  if (p.due_day !== undefined) p.due_day = clampDay(p.due_day);
  // bank / account_id podem vir null/undefined
  return p;
}

/**
 * Calcula o ciclo de fatura para uma data de referência.
 * Regra comum: o ciclo vai do dia (cut_day + 1) do mês anterior até o cut_day do mês corrente.
 * O vencimento é no due_day do mês corrente (ou próximo mês se due_day <= cut_day, conforme bancos).
 */
export function cycleFor(card: Pick<CreditCard, "cut_day" | "due_day">, refDate: Date | string = new Date()) {
  const cut = clampDay(card.cut_day);
  const due = clampDay(card.due_day);
  const d = new Date(refDate);
  if (!cut) return null;

  // end (fechamento) = dia cut do mês de ref
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), cut));
  // start = dia seguinte ao cut do mês anterior
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, cut));
  start.setUTCDate(start.getUTCDate() + 1);

  // dueDate: se due existir, usa o mês seguinte ao fechamento quando due <= cut (prática comum)
  let dueDate: Date | null = null;
  if (due) {
    const base = new Date(end);
    if (due <= cut) base.setUTCMonth(base.getUTCMonth() + 1);
    base.setUTCDate(due);
    dueDate = base;
  }

  return {
    startISO: start.toISOString().slice(0, 10),
    endISO: end.toISOString().slice(0, 10),
    dueISO: dueDate ? dueDate.toISOString().slice(0, 10) : null,
    start,
    end,
    dueDate,
  } as const;
}

export function useCreditCards() {
  const [data, setData] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(async (): Promise<CreditCard[]> => {
    setLoading(true);
    setError(null);
      const { data: rows, error } = await supabase
        .from("credit_cards")
      .select("*")
      .order("name", { ascending: true });
    if (error) {
      setError(error.message);
      setData([]);
      setLoading(false);
      return [];
    }
    setData(rows ?? []);
    setLoading(false);
    return rows ?? [];
  }, []);

  useEffect(() => { void list(); }, [list]);

  // ---------- CRUD ----------
  const create = useCallback(
    async (payload: Omit<CreditCard, "id" | "created_at">): Promise<CreditCard> => {
      const base = sanitize(payload);
        const { data: row, error } = await supabase
          .from("credit_cards")
        .insert(base)
        .select("*")
        .single();
      if (error) throw error;
      setData((d) => [...d, row]);
      return row;
    },
    []
  );

  const update = useCallback(
    async (id: string, patch: Partial<Omit<CreditCard, "id">>): Promise<void> => {
      const upd = sanitize(patch);
        const { error } = await supabase
          .from("credit_cards")
        .update(upd)
        .eq("id", id);
      if (error) throw error;
      await list();
    },
    [list]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase.from("credit_cards").delete().eq("id", id);
      if (error) throw error;
      setData((d) => d.filter((c) => c.id !== id));
    },
    []
  );

  const removeMany = useCallback(
    async (ids: string[]): Promise<void> => {
      if (!ids.length) return;
      const { error } = await supabase.from("credit_cards").delete().in("id", ids);
      if (error) throw error;
      setData((d) => d.filter((c) => !ids.includes(c.id)));
    },
    []
  );

  const upsert = useCallback(
    async (payload: Partial<CreditCard>) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        return update(id, rest);
      }
      return create(payload as Omit<CreditCard, "id" | "created_at">);
    },
    [create, update]
  );

  // ---------- Helpers ----------
  const findById = useCallback((id: string) => data.find(c => c.id === id) ?? null, [data]);
  const findByName = useCallback((name: string) => data.find(c => c.name === name) ?? null, [data]);

  const setLimit = useCallback(
    async (id: string, limit_amount: number | null) => update(id, { limit_amount }),
    [update]
  );
  const setCutDue = useCallback(
    async (id: string, cut_day: number | null, due_day: number | null) =>
      update(id, { cut_day, due_day }),
    [update]
  );
  const attachAccount = useCallback(
    async (id: string, account_id: string | null) => update(id, { account_id }),
    [update]
  );

  const byId = useMemo(() => new Map(data.map((c) => [c.id, c])), [data]);

  return {
    data,
    byId,
    loading,
    error,
    list,
    create,
    update,
    remove,
    removeMany,
    upsert,
    findById,
    findByName,
    setLimit,
    setCutDue,
    attachAccount,
    cycleFor,
  } as const;
}