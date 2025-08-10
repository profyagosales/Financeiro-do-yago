import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

export type CreditCard = {
  id: string;
  name: string;
  bank: string | null;
  limit_amount: number | null; // em centavos ou reais? aqui tratamos como reais (número)
  cut_day: number | null;      // dia do fechamento (1-31)
  due_day: number | null;      // dia do vencimento (1-31)
  account_id: string | null;   // conta para débito da fatura (opcional)
};

// ------- helpers internos -------
function clampDay(n: any): number | null {
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

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("credit_cards")
      .select("id,name,bank,limit_amount,cut_day,due_day,account_id")
      .order("name", { ascending: true });
    if (error) {
      setError(error.message);
      setData([]);
    } else {
      setData((data || []) as CreditCard[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void list(); }, [list]);

  // ---------- CRUD ----------
  type CreatePayload = Pick<CreditCard, "name"> &
    Partial<Pick<CreditCard, "bank" | "limit_amount" | "cut_day" | "due_day" | "account_id">>;

  const create = useCallback(async (payload: CreatePayload) => {
    const base = sanitize(payload);
    const toInsert = {
      name: base.name!,
      bank: base.bank ?? null,
      limit_amount: base.limit_amount ?? null,
      cut_day: base.cut_day ?? null,
      due_day: base.due_day ?? null,
      account_id: base.account_id ?? null,
    };
    const { error } = await supabase.from("credit_cards").insert(toInsert);
    if (error) throw error;
    await list();
  }, [list]);

  const update = useCallback(async (id: string, patch: Partial<Omit<CreditCard, "id">>) => {
    const upd = sanitize(patch);
    const { error } = await supabase.from("credit_cards").update(upd).eq("id", id);
    if (error) throw error;
    await list();
  }, [list]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("credit_cards").delete().eq("id", id);
    if (error) throw error;
    await list();
  }, [list]);

  const removeMany = useCallback(async (ids: string[]) => {
    if (!ids?.length) return;
    const { error } = await supabase.from("credit_cards").delete().in("id", ids);
    if (error) throw error;
    await list();
  }, [list]);

  const upsert = useCallback(async (payload: Partial<CreditCard>) => {
    if (payload.id) {
      const { id, ...rest } = payload as CreditCard;
      return update(id, rest);
    }
    return create(payload as CreatePayload);
  }, [create, update]);

  // ---------- Helpers ----------
  const findById = useCallback((id: string) => data.find(c => c.id === id) ?? null, [data]);
  const findByName = useCallback((name: string) => data.find(c => c.name === name) ?? null, [data]);

  const setLimit = useCallback(async (id: string, limit_amount: number | null) => update(id, { limit_amount }), [update]);
  const setCutDue = useCallback(async (id: string, cut_day: number | null, due_day: number | null) => update(id, { cut_day, due_day }), [update]);
  const attachAccount = useCallback(async (id: string, account_id: string | null) => update(id, { account_id }), [update]);

  // Mapa rápido por id (útil no UI)
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
    setCutDue,
    attachAccount,
    cycleFor, // exportamos helper puro para uso no UI
  } as const;
}