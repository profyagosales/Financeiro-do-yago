import { useEffect, useState, useCallback, useMemo } from "react";

import { supabase } from "@/lib/supabaseClient";

export type Card = {
  id: string;
  name: string;
  brand?: "visa" | "mastercard" | "elo" | "amex" | "hipercard" | string | null;
  last4?: string | null;
  limit?: number | null;
  closing_day?: number | null;
  due_day?: number | null;
  created_at?: string;
  // campos extras/legados ainda usados em partes do app
  account_id?: string | null;
  color?: string | null;
};

// ------- helpers internos -------
function clampDay(n: unknown): number | null {
  if (n === null || n === undefined) return null;
  const v = Math.max(1, Math.min(31, Number(n)));
  return Number.isFinite(v) ? v : null;
}

function sanitize(payload: Partial<Card>) {
  const p: Partial<Card> = { ...payload };
  if (typeof p.name === "string") p.name = p.name.trim();
  if (typeof p.brand === "string") p.brand = p.brand.trim();
  if (p.closing_day !== undefined) p.closing_day = clampDay(p.closing_day);
  if (p.due_day !== undefined) p.due_day = clampDay(p.due_day);
  return p;
}

/**
 * Calcula o ciclo de fatura para uma data de referência.
 * Regra comum: o ciclo vai do dia (closing_day + 1) do mês anterior até o closing_day do mês corrente.
 * O vencimento é no due_day do mês corrente (ou próximo mês se due_day <= closing_day, conforme bancos).
 */
export function cycleFor(card: Pick<Card, "closing_day" | "due_day">, refDate: Date | string = new Date()) {
  const cut = clampDay(card.closing_day);
  const due = clampDay(card.due_day);
  const d = new Date(refDate);
  if (!cut) return null;

  // end (fechamento) = dia closing_day do mês de ref
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), cut));
  // start = dia seguinte ao closing_day do mês anterior
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, cut));
  start.setUTCDate(start.getUTCDate() + 1);

  // dueDate: se due existir, usa o mês seguinte ao fechamento quando due <= closing_day
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
  const [data, setData] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(async (): Promise<Card[]> => {
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
    const mapped = (rows ?? []).map((r: any) => ({
      ...r,
      limit: r.limit ?? r.limit_amount ?? null,
      closing_day: r.closing_day ?? r.cut_day ?? null,
    })) as Card[];
    setData(mapped);
    setLoading(false);
    return mapped;
  }, []);

  useEffect(() => { void list(); }, [list]);

  // ---------- CRUD ----------
  const create = useCallback(
    async (payload: Omit<Card, "id" | "created_at">): Promise<Card> => {
      const base = sanitize(payload);
      const db: any = { ...base };
      if (db.limit !== undefined) { db.limit_amount = db.limit; delete db.limit; }
      if (db.closing_day !== undefined) { db.cut_day = db.closing_day; delete db.closing_day; }
      const { data: row, error } = await supabase
        .from("credit_cards")
        .insert(db)
        .select("*")
        .single();
      if (error) throw error;
      const mapped: Card = {
        ...row,
        limit: (row as any).limit ?? (row as any).limit_amount ?? null,
        closing_day: (row as any).closing_day ?? (row as any).cut_day ?? null,
      };
      setData(d => [...d, mapped]);
      return mapped;
    },
    []
  );

  const update = useCallback(
    async (id: string, patch: Partial<Omit<Card, "id">>): Promise<void> => {
      const upd = sanitize(patch);
      const db: any = { ...upd };
      if (db.limit !== undefined) { db.limit_amount = db.limit; delete db.limit; }
      if (db.closing_day !== undefined) { db.cut_day = db.closing_day; delete db.closing_day; }
      const { data: row, error } = await supabase
        .from("credit_cards")
        .update(db)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      const mapped: Card = {
        ...row,
        limit: (row as any).limit ?? (row as any).limit_amount ?? null,
        closing_day: (row as any).closing_day ?? (row as any).cut_day ?? null,
      };
      setData(d => d.map(c => (c.id === id ? mapped : c)));
    },
    []
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase.from("credit_cards").delete().eq("id", id);
      if (error) throw error;
      setData(d => d.filter(c => c.id !== id));
    },
    []
  );

  const removeMany = useCallback(
    async (ids: string[]): Promise<void> => {
      if (!ids.length) return;
      const { error } = await supabase.from("credit_cards").delete().in("id", ids);
      if (error) throw error;
      setData(d => d.filter(c => !ids.includes(c.id)));
    },
    []
  );

  const upsert = useCallback(
    async (payload: Partial<Card>) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        return update(id, rest);
      }
      return create(payload as Omit<Card, "id" | "created_at">);
    },
    [create, update]
  );

  // ---------- Helpers ----------
  const findById = useCallback((id: string) => data.find(c => c.id === id) ?? null, [data]);
  const findByName = useCallback((name: string) => data.find(c => c.name === name) ?? null, [data]);

  const setLimit = useCallback(
    async (id: string, limit: number | null) => update(id, { limit }),
    [update],
  );
  const setDays = useCallback(
    async (id: string, closing_day: number | null, due_day: number | null) =>
      update(id, { closing_day, due_day }),
    [update],
  );
  const attachAccount = useCallback(
    async (id: string, account_id: string | null) => update(id, { account_id }),
    [update],
  );

  const byId = useMemo(() => new Map(data.map(c => [c.id, c])), [data]);

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
    setDays,
    attachAccount,
    cycleFor,
  } as const;
}

