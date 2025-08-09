// src/components/FilterBar.tsx
import React from "react";
import { usePeriod } from "@/state/periodFilter";
import { CalendarRange, Calendar, ChevronDown } from "lucide-react";

const ANOS = (() => {
  const y = new Date().getFullYear();
  const arr: number[] = [];
  for (let i = y + 1; i >= y - 6; i--) arr.push(i);
  return arr;
})();

const MESES: { v: number; n: string }[] = [
  { v: 1, n: "Jan" }, { v: 2, n: "Fev" }, { v: 3, n: "Mar" },
  { v: 4, n: "Abr" }, { v: 5, n: "Mai" }, { v: 6, n: "Jun" },
  { v: 7, n: "Jul" }, { v: 8, n: "Ago" }, { v: 9, n: "Set" },
  { v: 10, n: "Out" }, { v: 11, n: "Nov" }, { v: 12, n: "Dez" },
];

export default function FilterBar() {
  const { mode, month, year, setMode, setMonth, setYear } = usePeriod();

  return (
    <div
      className={`
        card-surface
        mx-auto flex w-full max-w-xl flex-wrap items-center justify-center gap-2 p-2 sm:gap-3 sm:p-3
      `}
      aria-label="Filtro da dashboard"
    >
      {/* Toggle Mensal/Anual (segmentado) */}
      <div className="inline-flex overflow-hidden rounded-xl border border-white/30 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-zinc-900/50">
        <button
          onClick={() => setMode("monthly")}
          className={`px-3 py-2 text-sm transition ${
            mode === "monthly"
              ? "bg-emerald-600 text-white"
              : "text-zinc-700 hover:bg-white/60 dark:text-zinc-200 dark:hover:bg-white/10"
          }`}
          aria-pressed={mode === "monthly"}
        >
          Mensal
        </button>
        <button
          onClick={() => setMode("yearly")}
          className={`px-3 py-2 text-sm transition ${
            mode === "yearly"
              ? "bg-emerald-600 text-white"
              : "text-zinc-700 hover:bg-white/60 dark:text-zinc-200 dark:hover:bg-white/10"
          }`}
          aria-pressed={mode === "yearly"}
        >
          Anual
        </button>
      </div>

      {/* Seletor de mês (só no mensal) */}
      {mode === "monthly" && (
        <div className="relative inline-flex items-center rounded-xl border border-white/30 bg-white/70 px-3 backdrop-blur dark:border-white/10 dark:bg-zinc-900/50">
          <CalendarRange className="mr-2 h-4 w-4 text-emerald-600" aria-hidden />
          <select
            className="appearance-none bg-transparent py-2 pr-6 text-sm outline-none"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-label="Mês"
          >
            {MESES.map((m) => (
              <option key={m.v} value={m.v}>
                {m.n}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 opacity-60" aria-hidden />
        </div>
      )}

      {/* Seletor de ano */}
      <div className="relative inline-flex items-center rounded-xl border border-white/30 bg-white/70 px-3 backdrop-blur dark:border-white/10 dark:bg-zinc-900/50">
        <Calendar className="mr-2 h-4 w-4 text-emerald-600" aria-hidden />
        <select
          className="appearance-none bg-transparent py-2 pr-6 text-sm outline-none"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          aria-label="Ano"
        >
          {ANOS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 opacity-60" aria-hidden />
      </div>
    </div>
  );
}