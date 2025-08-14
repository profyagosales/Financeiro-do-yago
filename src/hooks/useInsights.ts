import { useMemo } from 'react';

import type { Transaction } from '@/hooks/useTransactions';
import type { Category } from '@/hooks/useCategories';
import type { Bill } from '@/hooks/useBills';
import type { GoalRow } from '@/hooks/useGoals';

export type Mile = {
  program: string;
  amount: number;
  expires_at: string; // ISO date
};

export type Insight = {
  id: string;
  message: string;
};

export type InsightInput = {
  transactions: Transaction[];
  categories: Category[];
  bills: Bill[];
  goals: GoalRow[];
  miles: Mile[];
};

/**
 * Hook that derives small financial insights from the current data set.
 *
 * The algorithm is intentionally heuristic/approximate – it only
 * computes insights when enough information is available and silently
 * skips otherwise.
 */
export function useInsights(
  period: { year: number; month: number },
  { transactions, categories, bills, goals, miles }: InsightInput
) {
  return useMemo<Insight[]>(() => {
    const out: Insight[] = [];
    const { year, month } = period;

    const pad = (m: number) => String(m).padStart(2, '0');
    const ymCur = `${year}-${pad(month)}`;
    const prev = new Date(year, month - 2, 1);
    const ymPrev = `${prev.getFullYear()}-${pad(prev.getMonth() + 1)}`;

    // ----- Variation in food category ---------------------------------
    const foodCat = categories.find((c) =>
      c.name.toLowerCase().includes('aliment')
    );
    if (foodCat) {
      const sumFor = (ym: string) =>
        transactions
          .filter(
            (t) =>
              t.amount < 0 &&
              t.category_id === foodCat.id &&
              (t.date || '').startsWith(ym)
          )
          .reduce((s, t) => s + Math.abs(t.amount), 0);
      const cur = sumFor(ymCur);
      const prevV = sumFor(ymPrev);
      if (prevV > 0) {
        const pct = ((cur - prevV) / prevV) * 100;
        out.push({
          id: 'food-var',
          message: `Gastos em alimentação ${
            pct >= 0 ? 'aumentaram' : 'diminuíram'
          } ${Math.abs(pct).toFixed(0)}% em relação ao mês anterior.`,
        });
      }
    }

    // ----- Category with greatest growth ------------------------------
    const curByCat: Record<string, number> = {};
    const prevByCat: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.amount >= 0) return;
      const ym = (t.date || '').slice(0, 7);
      const cat = t.category_id || 'uncat';
      const val = Math.abs(t.amount);
      if (ym === ymCur) curByCat[cat] = (curByCat[cat] || 0) + val;
      else if (ym === ymPrev) prevByCat[cat] = (prevByCat[cat] || 0) + val;
    });
    let growthCat: string | null = null;
    let growthPct = 0;
    Object.keys(curByCat).forEach((cat) => {
      const cur = curByCat[cat];
      const prevV = prevByCat[cat] || 0;
      if (prevV === 0) return;
      const g = (cur - prevV) / prevV;
      if (g > growthPct) {
        growthPct = g;
        growthCat = cat;
      }
    });
    if (growthCat) {
      const name =
        categories.find((c) => c.id === growthCat)?.name || 'Alguma categoria';
      out.push({
        id: 'cat-growth',
        message: `${name} teve o maior crescimento de gastos (${(
          growthPct * 100
        ).toFixed(0)}%).`,
      });
    }

    // ----- Budget nearing 85% -----------------------------------------
    const spentByCat: Record<string, number> = {};
    transactions
      .filter((t) => t.amount < 0 && (t.date || '').startsWith(ymCur))
      .forEach((t) => {
        const key = t.category_id || 'uncat';
        spentByCat[key] = (spentByCat[key] || 0) + Math.abs(t.amount);
      });
    type BudgetedCategory = Category & { budget?: number };
    const budgetHit = (categories as BudgetedCategory[]).find((c) => {
      if (!c.budget) return false;
      const spent = spentByCat[c.id] || 0;
      return spent / c.budget >= 0.85;
    });
    if (budgetHit) {
      const spent = spentByCat[budgetHit.id] || 0;
      const pct = Math.round((spent / (budgetHit.budget || 1)) * 100);
      out.push({
        id: `budget-${budgetHit.id}`,
        message: `${budgetHit.name} já atingiu ${pct}% do orçamento do mês.`,
      });
    }

    // ----- Miles expiring soon ----------------------------------------
    const soon = miles.filter((m) => {
      const d = new Date(m.expires_at);
      const now = new Date();
      const diff = d.getTime() - now.getTime();
      return diff > 0 && diff < 1000 * 60 * 60 * 24 * 30; // 30 dias
    });
    soon.forEach((m) => {
      out.push({
        id: `mile-${m.program}-${m.expires_at}`,
        message: `${m.amount} milhas em ${m.program} expiram em ${new Date(
          m.expires_at
        ).toLocaleDateString('pt-BR')}.`,
      });
    });

    // ----- Bills due soon ---------------------------------------------
    bills
      .filter((b) => {
        if (b.paid) return false;
        const diff = new Date(b.due_date).getTime() - Date.now();
        return diff > 0 && diff < 1000 * 60 * 60 * 24 * 7; // 7 dias
      })
      .forEach((b) => {
        out.push({
          id: `bill-${b.id}`,
          message: `Conta "${b.description}" vence em ${new Date(
            b.due_date
          ).toLocaleDateString('pt-BR')}.`,
        });
      });

    // ----- Goals close to deadline ------------------------------------
    goals
      .filter((g) => g.days_remaining <= 30 && g.progress_pct < 100)
      .forEach((g) => {
        out.push({
          id: `goal-${g.id}`,
          message: `Meta "${g.title}" expira em ${g.days_remaining} dias.`,
        });
      });

    return out;
  }, [period, transactions, categories, bills, goals, miles]);
}

export type UseInsightsReturn = ReturnType<typeof useInsights>;

