import InsightCard from "./InsightCard";

import { useInsights } from "@/hooks/useInsights";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useBills } from "@/hooks/useBills";
import { useGoals } from "@/hooks/useGoals";
import { usePeriod } from "@/state/periodFilter";

export default function InsightsSection() {
  const { year, month } = usePeriod();
  const { data: transactions } = useTransactions(year, month);
  const { flat: categories } = useCategories();
  const { data: bills } = useBills(year, month);
  const { data: goals } = useGoals();

  const insights = useInsights(
    { year, month },
    { transactions, categories, bills, goals, miles: [] }
  );

  if (!insights.length) return null;

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((ins) => (
        <InsightCard key={ins.id} insight={ins} />
      ))}
    </section>
  );
}

