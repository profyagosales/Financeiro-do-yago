import { Link } from "react-router-dom";

import { useBills } from "@/hooks/useBills";
import { formatCurrency } from "@/lib/utils";
import { usePeriod } from "@/state/periodFilter";

export interface UpcomingBillItem {
  name: string;
  dueDate: string;
  amount: number;
}

interface UpcomingBillsProps {
  /**
   * Optional mocked list of bills. Used when `useBills` hook is not available.
   */
  items?: UpcomingBillItem[];
  /** Number of items to display */
  limit?: number;
}

export default function UpcomingBills({ items, limit = 5 }: UpcomingBillsProps) {
  // determine period; if hook not in provider, fallback to current month/year
  let month: number;
  let year: number;
  try {
    const period = usePeriod();
    month = period.month;
    year = period.year;
  } catch {
    const now = new Date();
    month = now.getMonth() + 1;
    year = now.getFullYear();
  }

  const { data } = useBills(year, month);

  const bills: UpcomingBillItem[] = (items && items.length
    ? items
    : data.map((b) => ({
        name: b.description,
        dueDate: b.due_date,
        amount: b.amount,
      })))
    .filter((b) => new Date(b.dueDate) >= new Date())
    .slice(0, limit);

  return (
    <section role="region" className="glass-card space-y-2 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">Próximas contas</h3>
        <Link to="/bills" className="text-sm text-emerald-700 hover:underline">
          Ver todos
        </Link>
      </div>
      {bills.length === 0 ? (
        <p className="text-sm text-muted-foreground">sem dados</p>
      ) : (
        <ul className="divide-y divide-zinc-100/60 dark:divide-zinc-800/60 text-sm">
          {bills.map((b) => (
            <li key={b.name + b.dueDate} className="flex items-center justify-between py-2">
              <span className="truncate">{b.name}</span>
              <span className="flex items-center gap-2">
                <time dateTime={b.dueDate}>
                  {new Date(b.dueDate).toLocaleDateString("pt-BR")}
                </time>
                <span className="font-medium">{formatCurrency(b.amount)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

