import { useEffect, useMemo, useState, useCallback } from "react";

import { supabase } from "@/lib/supabaseClient";
import { exportTransactionsPDF } from "@/utils/pdf";

// ===== Tipos base (compatíveis com tabela atual) ============================
export type Transaction = {
  id: number;                 // bigint
  date: string;               // YYYY-MM-DD (UTC)
  description: string;
  amount: number;             // < 0 despesa, > 0 receita
  category_id?: string | null;
  account_id?: string | null;
  card_id?: string | null;
  installment_no?: number | null;      // 1..N
  installment_total?: number | null;   // N
  parent_installment_id?: number | null; // (opcional se usarmos mais tarde)
};

// DTO de alto nível para criação/edição no modal
export type TransactionInput = {
  date: string; // YYYY-MM-DD
  description: string;
  value: number; // sempre POSITIVO no formulário
  type: "income" | "expense"; // define o sinal no banco
  category_id?: string | null;
  // Fonte de pagamento (uma OU outra)
  source_kind?: "account" | "card";
  source_id?: string | null;
  // Cartão: parcelas
  installments?: number | null; // se >1, gera N lançamentos mensais
  // Extra (futuro)
  notes?: string | null;
  attachment_url?: string | null;
};

// ===== Helpers de data (seguro em UTC) =====================================
function coercePeriod(year?: unknown, month?: unknown) {
  const now = new Date();
  let y = Number(year);
  let m = Number(month);
  if (!Number.isInteger(y) || y < 1970 || y > 9999) y = now.getFullYear();
  if (!Number.isInteger(m) || m < 1 || m > 12) m = now.getMonth() + 1;
  return { y, m };
}
function isoDateUTC(y: number, mZeroBased: number, day: number) {
  const d = new Date(Date.UTC(y, mZeroBased, day));
  return d.toISOString().slice(0, 10);
}
function monthBoundsISO(year?: unknown, month?: unknown) {
  const { y, m } = coercePeriod(year, month);
  const start = isoDateUTC(y, m - 1, 1);
  const end = isoDateUTC(y, m, 0); // dia 0 do mês seguinte = último dia do mês
  return { y, m, start, end };
}
function addMonthsISO(iso: string, months: number) {
  // iso: YYYY-MM-DD (UTC)
  const [Y, M, D] = iso.split("-").map((n) => Number(n));
  const d = new Date(Date.UTC(Y, (M - 1) + months, D));
  return d.toISOString().slice(0, 10);
}

function daysInMonth(y: number, m1to12: number) {
  return new Date(Date.UTC(y, m1to12, 0)).getUTCDate();
}
function mapDateToYearMonth(iso: string, targetY: number, targetM1to12: number) {
  // Mantém o dia, mas recorta se o mês alvo tiver menos dias
  const [, , D] = iso.split("-").map((n) => Number(n));
  const maxD = daysInMonth(targetY, targetM1to12);
  const d = Math.min(D || 1, maxD);
  return isoDateUTC(targetY, targetM1to12 - 1, d);
}
function stripInstallmentSuffix(desc: string) {
  // Remove sufixos do tipo " (1/12)" no final da descrição
  return (desc || "").replace(/\s*\(\s*\d+\s*\/\s*\d+\s*\)\s*$/, "").trim();
}

export type YearSummary = {
  year: number;
  months: Array<{
    month: number;
    income: number;
    expense: number;
    balance: number;
    byCategory: Record<string, number>;
  }>;
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
};

/**
 * Retorna agregações anuais de transações agrupadas por mês e categoria.
 * - `income` e `expense` são valores positivos.
 * - `balance` = income - expense.
 * - `byCategory` contém apenas despesas agrupadas por categoria.
 */
export async function getYearSummary(year: number): Promise<YearSummary> {
  const y = Number(year);
  const start = isoDateUTC(y, 0, 1);
  const end = isoDateUTC(y, 11, 31);

  const { data, error } = await supabase
    .from("transactions")
    .select("date, amount, category_id")
    .gte("date", start)
    .lte("date", end);
  if (error) throw error;

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0,
    balance: 0,
    byCategory: {} as Record<string, number>,
  }));

  let totalIncome = 0;
  let totalExpense = 0;

  (data || []).forEach((t) => {
    const mIdx = Number((t.date as string).slice(5, 7)) - 1;
    if (mIdx < 0 || mIdx > 11) return;
    const amount = Number(t.amount) || 0;
    if (amount >= 0) {
      months[mIdx].income += amount;
      totalIncome += amount;
    } else {
      const v = Math.abs(amount);
      months[mIdx].expense += v;
      totalExpense += v;
      const cat = ((t.category_id as string | null) ?? 'null') as string;
      const catMap = months[mIdx].byCategory;
      catMap[cat] = (catMap[cat] ?? 0) + v;
    }
  });

  months.forEach((m) => {
    m.balance = (Number(m.income) || 0) - (Number(m.expense) || 0);
  });

  return {
    year: y,
    months,
    totalIncome,
    totalExpense,
    totalBalance: totalIncome - totalExpense,
  };
}

// ===== Hook principal =======================================================
export function useTransactions(year?: any, month?: any) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { y, m, start, end } = useMemo(() => monthBoundsISO(year, month), [year, month]);

  // ----- Load (por período) -------------------------------------------------
  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true })
        .order("id", { ascending: true });
      if (error) throw error;
      setData((data || []) as Transaction[]);
    } catch (e: unknown) {
      console.error("[useTransactions] list error:", e);
      setError(e instanceof Error ? e.message : "Erro ao carregar transações");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => { if (start && end) void list(); }, [list, start, end]);

  // ----- CRUD de baixo nível (compat) --------------------------------------
  const create = useCallback(async (t: Omit<Transaction, "id">) => {
    const { data: inserted, error } = await supabase
      .from("transactions")
      .insert(t as unknown as Transaction)
      .select()
      .single();
    if (error) throw error;
    await list();
    return inserted as Transaction;
  }, [list]);

  const bulkCreate = useCallback(async (rows: Omit<Transaction, "id">[]) => {
    if (!rows?.length) return [];
    const { data: inserted, error } = await supabase
      .from("transactions")
      .insert(rows as unknown as Transaction[])
      .select();
    if (error) throw error;
    await list();
    return (inserted || []) as Transaction[];
  }, [list]);

  const update = useCallback(async (id: number, patch: Partial<Transaction>) => {
    const { error } = await supabase.from("transactions").update(patch).eq("id", id);
    if (error) throw error;
    await list();
  }, [list]);

  const remove = useCallback(async (id: number) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw error;
    await list();
  }, [list]);

  // ----- Nivel alto: criação com regras de negócio -------------------------
  /**
   * Cria 1..N transações a partir de um DTO de formulário.
   * - Converte value -> amount com sinal (despesa negativo, receita positivo)
   * - Se cartão + parcelas>1: gera N lançamentos mensais com installment_no/total
   * - Mapeia source_kind/source_id para account_id/card_id
   */
  const addSmart = useCallback(async (dto: TransactionInput): Promise<Transaction[]> => {
    const baseValue = Math.abs(Number(dto.value || 0));
    if (!baseValue) throw new Error("Valor inválido");

    const amount = dto.type === "expense" ? -baseValue : baseValue;

    const isCard = dto.source_kind === "card" && dto.source_id;
    const installments = isCard ? Math.max(1, Number(dto.installments || 1)) : 1;

    const common = {
      description: dto.description?.trim() || "",
      category_id: dto.category_id ?? null,
      account_id: !isCard ? (dto.source_id ?? null) : null,
      card_id: isCard ? (dto.source_id ?? null) : null,
    } as Omit<Transaction, "id" | "date" | "amount">;

    if (installments === 1) {
      const row: Omit<Transaction, "id"> = {
        date: dto.date,
        description: common.description,
        amount,
        category_id: common.category_id,
        account_id: common.account_id,
        card_id: common.card_id,
        installment_no: null,
        installment_total: null,
        parent_installment_id: null,
      };
      const r = await create(row);
      return [r];
    }

    // Parcelado: gera N linhas mês a mês
    const rows: Omit<Transaction, "id">[] = [];
    for (let i = 0; i < installments; i++) {
      const d = i === 0 ? dto.date : addMonthsISO(dto.date, i);
      rows.push({
        date: d,
        description: `${common.description} (${i + 1}/${installments})`,
        amount,
        category_id: common.category_id,
        account_id: common.account_id,
        card_id: common.card_id,
        installment_no: i + 1,
        installment_total: installments,
        parent_installment_id: null, // poderemos preencher depois se adotarmos grupo
      });
    }
    const inserted = await bulkCreate(rows);
    return inserted;
  }, [create, bulkCreate]);

  // ----- Filtros locais (UI) -----------------------------------------------

  /** Obtém uma transação pelo id a partir do cache atual (ou undefined). */
  const getById = useCallback((id: number) => data.find(d => d.id === id), [data]);

  /**
   * Duplica várias transações para um mês/ano alvo.
   * - Reposiciona as datas para o mês/ano destino, preservando o dia (limitado ao fim do mês quando necessário).
   * - Se a origem for parcelada (installment_total>1), recria a série completa a partir do novo mês.
   * - Remove sufixos (x/N) da descrição ao gerar novas parcelas.
   */
  const duplicateMany = useCallback(async (
    ids: number[],
    targetYear: number,
    targetMonth1to12: number,
  ) => {
    if (!ids?.length) return;
    const pick = data.filter(d => ids.includes(d.id));
    if (!pick.length) return;

    const rows: Omit<Transaction, "id">[] = [];
    for (const src of pick) {
      const baseDesc = stripInstallmentSuffix(src.description);
      const baseDate = mapDateToYearMonth(src.date, targetYear, targetMonth1to12);

      const isParcelado = (src.installment_total || 0) > 1 && src.card_id;
      if (!isParcelado) {
        rows.push({
          date: baseDate,
          description: baseDesc,
          amount: src.amount,
          category_id: src.category_id ?? null,
          account_id: src.account_id ?? null,
          card_id: src.card_id ?? null,
          installment_no: null,
          installment_total: null,
          parent_installment_id: null,
        });
        continue;
      }
      // Recria a série parcelada a partir do mês alvo
      const total = Number(src.installment_total);
      for (let i = 0; i < total; i++) {
        const d = i === 0 ? baseDate : addMonthsISO(baseDate, i);
        rows.push({
          date: d,
          description: `${baseDesc} (${i + 1}/${total})`,
          amount: src.amount,
          category_id: src.category_id ?? null,
          account_id: null,              // parcelas em cartão
          card_id: src.card_id ?? null,
          installment_no: i + 1,
          installment_total: total,
          parent_installment_id: null,
        });
      }
    }
    await bulkCreate(rows);
  }, [data, bulkCreate]);

  type LocalFilter = {
    q?: string;                    // busca no description
    categoryId?: string | null;
    source?: { kind: "account" | "card"; id: string | null } | null;
    type?: "income" | "expense" | "all";
  };

  const filterLocal = useCallback((list: Transaction[], f: LocalFilter) => {
    let out = list.slice(0);
    if (f.q) {
      const q = f.q.toLowerCase();
      out = out.filter((t) => (t.description || "").toLowerCase().includes(q));
    }
    if (f.categoryId) out = out.filter((t) => t.category_id === f.categoryId);
    if (f.source) {
      if (f.source.kind === "account") out = out.filter((t) => t.account_id === f.source!.id);
      if (f.source.kind === "card") out = out.filter((t) => t.card_id === f.source!.id);
    }
    if (f.type && f.type !== "all") {
      out = out.filter((t) => (f.type === "income" ? t.amount > 0 : t.amount < 0));
    }
    return out;
  }, []);

  // ----- KPIs --------------------------------------------------------------
  const kpis = useMemo(() => {
    const entradas = data.filter((d) => d.amount > 0).reduce((s, d) => s + d.amount, 0);
    const saidas = data.filter((d) => d.amount < 0).reduce((s, d) => s + d.amount, 0);
    return {
      entradas,
      saidas: Math.abs(saidas),
      saldo: entradas + saidas,
    };
  }, [data]);

  // API compat + novas
  const add = create; // alias compat (cria uma linha "crua")

  return {
    data,
    loading,
    error,
    // período atual
    year: y,
    month: m,
    start,
    end,
    // crud base
    list,
    create,
    add,
    bulkCreate,
    update,
    remove,
    // utilidades
    getById,
    duplicateMany,
    exportTransactionsPDF,
    // alto nível
    addSmart,
    filterLocal,
    kpis,
  } as const;
}