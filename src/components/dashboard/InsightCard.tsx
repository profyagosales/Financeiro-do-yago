import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { WidgetCard } from "./WidgetCard";

// Card used to display quick insights or shortcuts on the dashboard.
export default function InsightCard({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <WidgetCard className="group h-full border-0 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_2px_12px_-3px_rgba(16,185,129,0.3)] transition hover:scale-[1.01]">
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
          {icon}
        </span>
        <span className="font-semibold">{title}</span>
      </div>
      <div className="mb-4 text-sm text-white/80">{desc}</div>
      <Link
        to={to}
        className="inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30"
      >
        Abrir
      </Link>
    </WidgetCard>
  );
}
