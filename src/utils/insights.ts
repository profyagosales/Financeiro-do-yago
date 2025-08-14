import type { UITransaction as ImportedUITransaction } from "@/components/TransactionsTable";
import type { Insight } from "@/hooks/useInsights";

// Fallback transaction shape if UITransaction type is unavailable
export type LocalTransaction = {
  id?: string | number;
  date: string;
  description?: string;
  value?: number;
  amount?: number;
  type?: "income" | "expense";
  category?: string | null;
};

export type Transaction = ImportedUITransaction | LocalTransaction;

export interface RecurringBill {
  description: string;
  avgAmount: number;
  intervalDays: number;
}

const DAY = 1000 * 60 * 60 * 24;

function getAmount(t: Transaction) {
  if (typeof (t as any).value === "number") return Math.abs((t as any).value);
  if (typeof (t as any).amount === "number") return Math.abs((t as any).amount);
  return 0;
}

function isExpense(t: Transaction) {
  if ((t as any).type) return (t as any).type === "expense";
  if (typeof (t as any).amount === "number") return (t as any).amount < 0;
  return true;
}

/**
 * Compare month-over-month variation of a category.
 * Returns percentage difference between the latest month and the previous one.
 */
export function compareCategoryMoM(
  transactions: Transaction[],
  categoryName: string
): number | null {
  const cat = categoryName.toLowerCase();
  const totals: Record<string, number> = {};
  transactions.forEach((t) => {
    if (!isExpense(t)) return;
    if ((t.category || "").toLowerCase() !== cat) return;
    const ym = (t.date || "").slice(0, 7);
    if (!ym) return;
    totals[ym] = (totals[ym] || 0) + getAmount(t);
  });
  const months = Object.keys(totals).sort();
  if (months.length < 2) return null;
  const cur = totals[months[months.length - 1]];
  const prev = totals[months[months.length - 2]];
  if (!prev) return null;
  return ((cur - prev) / prev) * 100;
}

function normalizeDesc(s: string) {
  return s.toLowerCase().replace(/\d+/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Detects likely recurring bills by looking for similar descriptions and
 * consistent periodicity/amount.
 */
export function detectRecurringBills(transactions: Transaction[]): RecurringBill[] {
  const groups: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    if (!isExpense(t)) continue;
    const key = normalizeDesc(t.description || "");
    if (!key) continue;
    (groups[key] ||= []).push(t);
  }

  const out: RecurringBill[] = [];
  Object.values(groups).forEach((arr) => {
    if (arr.length < 3) return;
    const sorted = arr
      .map((t) => ({ date: new Date(t.date), amount: getAmount(t), desc: t.description || "" }))
      .sort((a, b) => +a.date - +b.date);
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push((+sorted[i].date - +sorted[i - 1].date) / DAY);
    }
    if (intervals.length < 2) return;
    const avgInterval = intervals.reduce((s, n) => s + n, 0) / intervals.length;
    if (intervals.some((i) => Math.abs(i - avgInterval) > 5)) return;
    const amounts = sorted.map((t) => t.amount);
    const avgAmount = amounts.reduce((s, n) => s + n, 0) / amounts.length;
    if (amounts.some((a) => Math.abs(a - avgAmount) / avgAmount > 0.1)) return;
    out.push({
      description: sorted[sorted.length - 1].desc,
      avgAmount,
      intervalDays: avgInterval,
    });
  });
  return out;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Builds a list of insights ready to be displayed in InsightCard components.
 */
export function buildOverviewInsights(transactions: Transaction[]): Insight[] {
  const insights: Insight[] = [];

  const categories = Array.from(
    new Set(transactions.map((t) => t.category).filter(Boolean) as string[])
  );

  let top: { cat: string; pct: number } | null = null;
  categories.forEach((cat) => {
    const pct = compareCategoryMoM(transactions, cat);
    if (pct === null) return;
    if (!top || Math.abs(pct) > Math.abs(top.pct)) top = { cat, pct };
  });

  if (top && Math.abs(top.pct) >= 20) {
    insights.push({
      id: `cat-${slugify(top.cat)}`,
      message: `Gastos em ${top.cat} ${
        top.pct >= 0 ? "aumentaram" : "diminuíram"
      } ${Math.abs(top.pct).toFixed(0)}% em relação ao mês anterior.`,
    });
  }

  detectRecurringBills(transactions)
    .slice(0, 3)
    .forEach((b) => {
      insights.push({
        id: `bill-${slugify(b.description)}`,
        message: `Conta "${b.description}" parece recorrente (~${brl(
          b.avgAmount
        )} a cada ${Math.round(b.intervalDays)} dias).`,
      });
    });

  return insights;
}

