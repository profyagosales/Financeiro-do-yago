import React from "react";

export default function KpiCard({
  label,
  value,
  trend,
  onClick,
}: { label: string; value: string; trend?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-black/10 bg-background/60 p-4 text-left shadow-sm backdrop-blur transition hover:border-emerald-400/40 dark:border-white/10"
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {trend && <div className="mt-1 text-xs text-emerald-500">{trend}</div>}
    </button>
  );
}
