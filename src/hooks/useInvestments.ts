import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabaseClient";

/**
 * Hook padronizado para Investimentos
 * - Compatível com tipos: "renda_fixa" | "fii" | "acoes" | "cripto" (snake) e "Renda fixa" | "FIIs" | "Ações" | "Cripto" | "Outros" (PT-BR)
 * - Filtros por mês/ano, tipo e busca textual
 * - KPIs, distribuição por tipo e série mensal (12 meses)
 * - CRUD com fallback automático para coluna `note` ou `notes` no banco (insere/atualiza usando a que existir)
 */

type TypeSnake = "renda_fixa" | "fii" | "acoes" | "cripto";
type TypePt = "Renda fixa" | "FIIs" | "Ações" | "Cripto" | "Outros";
export type InvestmentType = TypeSnake | TypePt;

export type Investment = {
  id: number;
  user_id: string;
  type: InvestmentType;
  symbol: string | null;
  name: string;
  broker: string | null;
  quantity: number;
  price: number;
  fees: number;
  date: string; // yyyy-mm-dd
  // Banco pode ter `note` ou `notes`. Mantemos ambos como opcionais.
  note?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type NewInvestment = {
  type: InvestmentType;
  symbol?: string | null;
  name: string;
  broker?: string | null;
  quantity: number;
  price: number;
  fees?: number;
  date: string; // yyyy-mm-dd
  note?: string | null;  // preferível
  notes?: string | null; // compatibilidade
};

export type UseInvestmentsParams = {
  month?: number; // 1..12
  year?: number;  // yyyy
  type?: InvestmentType | "all";
  q?: string;     // busca textual
};

function normalizeType(t?: InvestmentType | null): TypePt | "Outros" {
  if (!t) return "Outros";
  const map: Record<string, TypePt> = {
    renda_fixa: "Renda fixa",
    fii: "FIIs",
    acoes: "Ações",
    cripto: "Cripto",
    "renda fixa": "Renda fixa",
    "fiis": "FIIs",
    "ações": "Ações",
  };
  const key = String(t).toLowerCase();
  return map[key] ?? ("Outros" as const);
}

function monthBounds(month?: number, year?: number) {
  if (!month || !year) return null;
  const start = dayjs(`${year}-${String(month).padStart(2, "0")}-01`);
  const end = start.add(1, "month");
  return {
    gte: start.format("YYYY-MM-DD"),
    lt: end.format("YYYY-MM-DD"),
  };
}

export function useInvestments(params: UseInvestmentsParams = {}) {
  const { month, year, type = "all", q } = params;
  const typeStr = (type as string) ?? "";
  const qStr = q ?? "";

  const [rows, setRows] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("investments")
        .select("*")
        .order("date", { ascending: false });

      // filtros básicos de data
      if (year && !month) {
        query = query
          .gte("date", dayjs(`${year}-01-01`).format("YYYY-MM-DD"))
          .lte("date", dayjs(`${year}-12-31`).format("YYYY-MM-DD"));
      }
      const mb = monthBounds(month, year);
      if (mb) {
        query = query.gte("date", mb.gte).lt("date", mb.lt);
      }

      // filtro de tipo (aceita snake/PT)
      if (typeStr && typeStr !== "all") {
        // tentamos tanto o valor snake quanto o normalizado
        const pt = normalizeType(typeStr);
        // Como é texto livre, filtramos pelo texto normalizado (ex.: "Renda fixa")
        query = query.eq("type", pt);
      }

      const { data, error } = await query;
      if (error) throw error;

      // busca textual (client-side)
      const text = qStr.trim().toLowerCase();
      const filtered = (data ?? []).filter((r) => {
        if (!text) return true;
        const hay = [
          r.name,
          r.symbol,
          r.broker,
          r.type,
          r.note,
          r.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(text);
      });

      // normaliza tipo e garante fees numérico
      const normalized: Investment[] = filtered.map((r: any) => ({
        ...r,
        type: normalizeType(r.type),
        fees: Number(r.fees || 0),
      }));

      setRows(normalized);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [month, year, typeStr, qStr]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---------- CRUD com fallback para note/notes ----------
  async function insertWithNote(payload: NewInvestment) {
    // monta base
    const base = {
      type: normalizeType(payload.type),
      symbol: payload.symbol ?? null,
      name: payload.name,
      broker: payload.broker ?? null,
      quantity: Number(payload.quantity || 0),
      price: Number(payload.price || 0),
      fees: Number(payload.fees ?? 0),
      date: payload.date,
    } as any;

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) throw new Error("Usuário não autenticado.");

    // Tentativa 1: usar `note`
    try {
      const { error } = await supabase
        .from("investments")
        .insert({ ...base, user_id: uid, note: payload.note ?? payload.notes ?? null });
      if (error) throw error;
      return;
    } catch {
      // Tentativa 2: usar `notes`
      const { error: e2 } = await supabase
        .from("investments")
        .insert({ ...base, user_id: uid, notes: payload.note ?? payload.notes ?? null });
      if (e2) throw e2;
    }
  }

  async function updateWithNote(id: number, patch: Partial<NewInvestment>) {
    const base = {
      type: patch.type ? normalizeType(patch.type) : undefined,
      symbol: patch.symbol,
      name: patch.name,
      broker: patch.broker,
      quantity: patch.quantity !== undefined ? Number(patch.quantity) : undefined,
      price: patch.price !== undefined ? Number(patch.price) : undefined,
      fees: patch.fees !== undefined ? Number(patch.fees) : undefined,
      date: patch.date,
    } as any;

    // remove undefineds
    Object.keys(base).forEach((k) => base[k] === undefined && delete base[k]);

    // Tentativa 1: `note`
    try {
      const { error } = await supabase
        .from("investments")
        .update({ ...base, note: patch.note ?? patch.notes ?? undefined })
        .eq("id", id);
      if (error) throw error;
      return;
    } catch {
      // Tentativa 2: `notes`
      const { error: e2 } = await supabase
        .from("investments")
        .update({ ...base, notes: patch.note ?? patch.notes ?? undefined })
        .eq("id", id);
      if (e2) throw e2;
    }
  }

  const add = async (payload: NewInvestment) => {
    await insertWithNote(payload);
    await fetchAll();
  };

  const update = async (id: number, patch: Partial<NewInvestment>) => {
    await updateWithNote(id, patch);
    await fetchAll();
  };

  const remove = async (id: number) => {
    const { error } = await supabase.from("investments").delete().eq("id", id);
    if (error) throw error;
    await fetchAll();
  };

  // -------------- Agregações --------------
  const withTotals = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        total: Number(r.quantity) * Number(r.price) + Number(r.fees || 0),
      })),
    [rows]
  );

  const kpis = useMemo(() => {
    const total = withTotals.reduce((s, r) => s + r.total, 0);
    const ativos = new Set(withTotals.map((r) => (r.symbol || r.name))).size;
    // operações do mês atual (do sistema)
    const opsMes = withTotals.filter((r) => dayjs(r.date).isSame(dayjs(), "month")).length;
    return { total, opsMes, ativos };
  }, [withTotals]);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of withTotals) {
      const t = normalizeType(r.type);
      map.set(t, (map.get(t) || 0) + r.total);
    }
    const keys: TypePt[] = ["Renda fixa", "FIIs", "Ações", "Cripto", "Outros"];
    return keys.map((k) => ({ name: k, value: map.get(k) || 0 }));
  }, [withTotals]);

  const monthly = useMemo(() => {
    // últimos 12 meses
    const base = dayjs().startOf("month").subtract(11, "month");
    const seq = Array.from({ length: 12 }).map((_, i) => base.add(i, "month"));
    const map: Record<string, number> = {};
    for (const r of withTotals) {
      const key = dayjs(r.date).format("YYYY-MM");
      map[key] = (map[key] || 0) + r.total;
    }
    return seq.map((d) => {
      const key = d.format("YYYY-MM");
      return { month: d.format("MMM/YY"), total: map[key] || 0 };
    });
  }, [withTotals]);

  return {
    rows: withTotals,
    loading,
    error,
    kpis,
    byType,
    monthly,
    add,
    update,
    remove,
    refetch: fetchAll,
  };
}