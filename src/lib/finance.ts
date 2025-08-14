import type { Transaction } from "@/hooks/useTransactions";
import type { Bill } from "@/hooks/useBills";
import type { Category } from "@/hooks/useCategories";

// Aggregate income, expenses and balance for a list of transactions.
export function getMonthlyAggregates(trans: Transaction[]) {
  const income = trans.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = trans.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  return { income, expense, balance: income - expense };
}

// Returns aggregates for the last 12 months based on transaction dates.
export function getLast12MonthsAggregates(trans: Transaction[]) {
  const now = new Date();
  const months: Array<{ key: string; income: number; expense: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7); // YYYY-MM
    months.push({ key, income: 0, expense: 0 });
  }
  const map = new Map(months.map(m => [m.key, m]));
  trans.forEach(t => {
    const key = (t.date || '').slice(0, 7);
    const item = map.get(key);
    if (!item) return;
    if (t.amount >= 0) item.income += t.amount; else item.expense += Math.abs(t.amount);
  });
  return months;
}

// Returns bills that are still unpaid and due in the future.
export function getUpcomingBills(bills: Bill[]) {
  const today = new Date();
  return bills
    .filter(b => !b.paid && new Date(b.due_date) >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
}

// Computes spending per category for the current month.
export function getBudgetUsage(categories: Category[], trans: Transaction[]) {
  const expenseByCat = new Map<string, number>();
  trans.forEach(t => {
    if (t.amount < 0) {
      const key = t.category_id || 'uncat';
      expenseByCat.set(key, (expenseByCat.get(key) || 0) + Math.abs(t.amount));
    }
  });
  return categories.map(c => ({
    category: c.name,
    spent: expenseByCat.get(c.id) || 0,
  }));
}

