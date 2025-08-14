import type { Transaction } from '@/data/transactions';
import type { Bill } from '@/hooks/useBills';

// Helper to get short month names in pt-BR
const monthShort = (n: number) => {
  const arr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return arr[Math.max(1, Math.min(12, n)) - 1];
};

export function getMonthlyAggregates(transactions: Transaction[], month: number, year: number) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.month === monthStr) {
      if (t.type === 'income') income += t.value;
      else expense += t.value;
    }
  }
  return { income, expense, balance: income - expense };
}

export function getLast12MonthsAggregates(
  transactions: Transaction[],
  endMonth: number,
  endYear: number,
) {
  const result: { m: string; in: number; out: number; saldo: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(endYear, endMonth - 1, 1);
    date.setMonth(date.getMonth() - i);
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    const agg = getMonthlyAggregates(transactions, m, y);
    result.push({ m: monthShort(m), in: agg.income, out: agg.expense, saldo: agg.balance });
  }
  return result;
}

export function getUpcomingBills(bills: Bill[], { days = 7 }: { days?: number }) {
  const today = new Date();
  const limit = new Date();
  limit.setDate(today.getDate() + days);
  return bills
    .filter((b) => {
      const due = new Date(b.due_date);
      return !b.paid && due >= today && due <= limit;
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
}

export interface BudgetMonth {
  transactions: Transaction[];
  budget?: number | null;
}

export function getBudgetUsage(currentMonth: BudgetMonth) {
  const { transactions, budget } = currentMonth;
  if (!budget) return null;
  const spent = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.value, 0);
  const remaining = budget - spent;
  const percent = budget === 0 ? 0 : Math.min(100, (spent / budget) * 100);
  return { budget, spent, remaining, percent };
}

export default {
  getMonthlyAggregates,
  getLast12MonthsAggregates,
  getUpcomingBills,
  getBudgetUsage,
};
