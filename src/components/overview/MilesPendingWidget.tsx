import { useMemo } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { periodRange, usePeriod } from "@/state/periodFilter";

// Placeholder pending miles; replace with data from useMiles when backend is ready
const MOCK_PENDING = [
  { qty: 500, expected_at: "2025-08-15" },
  { qty: 800, expected_at: "2025-08-20" },
  { qty: 1200, expected_at: "2025-09-05" },
];

export default function MilesPendingWidget() {
  const period = usePeriod();
  const { start, end } = periodRange(period);

  const total = useMemo(() => {
    return MOCK_PENDING.filter((m) => {
      const d = new Date(m.expected_at);
      return d >= start && d <= end;
    }).reduce((acc, cur) => acc + cur.qty, 0);
  }, [start, end]);

  return (
    <Link
      to="/milhas"
      className="glass-card block rounded-xl p-4 text-center transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
    >
  <div className="text-sm text-fg-muted">Milhas</div>
      {total > 0 ? (
        <div className="mt-1 flex items-baseline justify-center gap-2">
          <span className="text-2xl font-bold">{total.toLocaleString("pt-BR")}</span>
          <Badge variant="secondary" className="px-1 py-0">
            a receber
          </Badge>
        </div>
      ) : (
  <div className="mt-1 text-2xl font-bold text-fg-muted">—</div>
      )}
    </Link>
  );
}

