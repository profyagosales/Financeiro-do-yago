// src/components/FilterBar.tsx
import { motion } from 'framer-motion';
import { Calendar, CalendarBlank } from 'phosphor-react';
import { useCallback, type KeyboardEvent } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePeriod } from "@/state/periodFilter";

/**
 * Barra de filtro com selects premium (shadcn/ui) e navegação por teclado.
 */

type Props = {
  /** Visual density. `compact` usa menos padding (bom para headers estreitos). */
  variant?: "default" | "compact";
  className?: string;
};

const ANOS = (() => {
  const y = new Date().getFullYear();
  const arr: number[] = [];
  for (let i = y + 1; i >= y - 6; i--) arr.push(i);
  return arr;
})();

const MESES: { v: number; n: string }[] = [
  { v: 1, n: "Jan" },
  { v: 2, n: "Fev" },
  { v: 3, n: "Mar" },
  { v: 4, n: "Abr" },
  { v: 5, n: "Mai" },
  { v: 6, n: "Jun" },
  { v: 7, n: "Jul" },
  { v: 8, n: "Ago" },
  { v: 9, n: "Set" },
  { v: 10, n: "Out" },
  { v: 11, n: "Nov" },
  { v: 12, n: "Dez" },
];

export default function FilterBar({ variant = "default", className = "" }: Props) {
  const { mode, month, year, setMode, setMonth, setYear } = usePeriod();

  const wrapMonth = useCallback(
    (m: number) => {
      let mm = m;
      let yy = year;
      if (mm < 1) { mm = 12; yy = year - 1; }
      if (mm > 12) { mm = 1; yy = year + 1; }
      setYear(yy);
      setMonth(mm);
    },
    [setMonth, setYear, year]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowUp") { setYear(year + 1); e.preventDefault(); }
      else if (e.key === "ArrowDown") { setYear(year - 1); e.preventDefault(); }
      else if (mode === "monthly" && e.key === "ArrowLeft") { wrapMonth(month - 1); e.preventDefault(); }
      else if (mode === "monthly" && e.key === "ArrowRight") { wrapMonth(month + 1); e.preventDefault(); }
    },
    [mode, month, year, setYear, wrapMonth]
  );

  const pad = variant === "compact" ? "p-2 sm:p-2.5" : "p-2 sm:p-3";
  const gap = variant === "compact" ? "gap-2 sm:gap-2.5" : "gap-2 sm:gap-3";

  return (
    <motion.div
  className={`u-card-base ${pad} ${gap} mx-auto flex w-full max-w-xl flex-wrap items-center justify-center ${className}`}
      aria-label="Filtro de período"
      role="group"
      onKeyDown={onKeyDown}
      tabIndex={0}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toggle Mensal/Anual */}
  <div className="inline-flex overflow-hidden rounded-xl border border-white/30 bg-white/70 backdrop-blur shadow-sm">
        <button
          onClick={() => setMode("monthly")}
          className={`px-3 py-2 text-sm transition ${
            mode === "monthly"
              ? "bg-emerald-600 text-white"
              : "text-zinc-700 hover:bg-white/60"
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
              : "text-zinc-700 hover:bg-white/60"
          }`}
          aria-pressed={mode === "yearly"}
        >
          Anual
        </button>
      </div>

      {/* Seletor de mês (premium) */}
      {mode === "monthly" && (
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm">
            <CalendarBlank size={16} className="h-4 w-4 text-emerald-600" />
          </span>
          {/* Nunca usar "" como value controlado */}
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[120px] rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {MESES.map((m) => (
                <SelectItem key={m.v} value={String(m.v)}>
                  {m.n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Seletor de ano (premium) */}
      <div className="inline-flex items-center gap-2">
  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm">
          <Calendar size={16} className="h-4 w-4 text-emerald-600" />
        </span>
        {/* Nunca passe "" como value */}
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-[110px] rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent className="rounded-xl max-h-72">
            {ANOS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
}