// src/state/periodFilter.tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Mode = "monthly" | "quarterly" | "yearly" | "custom";

type PeriodState = {
  mode: Mode;
  month: number;   // 1..12
  year: number;    // YYYY
  setMode: (m: Mode) => void;
  setMonth: (m: number) => void;
  setYear: (y: number) => void;
};

const PeriodCtx = createContext<PeriodState | null>(null);

function readFromURL(): Partial<Pick<PeriodState, "mode" | "month" | "year">> {
  const p = new URLSearchParams(window.location.search);
  const mode = (p.get("mode") as Mode) || undefined;
  const month = p.get("month") ? Number(p.get("month")) : undefined;
  const year = p.get("year") ? Number(p.get("year")) : undefined;
  return { mode, month, year };
}

function writeToURL(mode: Mode, month: number, year: number) {
  const p = new URLSearchParams(window.location.search);
  p.set("mode", mode);
  p.set("year", String(year));
  if (mode === "monthly" || mode === "quarterly" || mode === "custom")
    p.set("month", String(month));
  else p.delete("month");
  const newUrl = `${window.location.pathname}?${p.toString()}${window.location.hash}`;
  window.history.replaceState(null, "", newUrl);
}

export function PeriodProvider({ children }: { children: ReactNode }) {
  const now = new Date();
  const initialMonth = now.getMonth() + 1;
  const initialYear = now.getFullYear();

  // prioridade: URL > localStorage > default atual
  const saved = (() => {
    const u = readFromURL();
    if (u.mode || u.month || u.year) return u;
    try {
      const raw = localStorage.getItem("fy.period");
      return raw ? (JSON.parse(raw) as Partial<PeriodState>) : {};
    } catch {
      return {};
    }
  })();

  const [mode, setMode] = useState<Mode>(saved.mode ?? "monthly");
  const [month, setMonth] = useState<number>(saved.month ?? initialMonth);
  const [year, setYear] = useState<number>(saved.year ?? initialYear);

  // sincroniza URL + localStorage
  useEffect(() => {
    writeToURL(mode, month, year);
    localStorage.setItem("fy.period", JSON.stringify({ mode, month, year }));
  }, [mode, month, year]);

  const value = useMemo<PeriodState>(
    () => ({ mode, month, year, setMode, setMonth, setYear }),
    [mode, month, year]
  );

  return <PeriodCtx.Provider value={value}>{children}</PeriodCtx.Provider>;
}

export function usePeriod() {
  const ctx = useContext(PeriodCtx);
  if (!ctx) throw new Error("usePeriod deve ser usado dentro de <PeriodProvider>");
  return ctx;
}

/** Utilidades úteis para consultas */
export function periodRange(state: { mode: Mode; month: number; year: number }) {
  if (state.mode === "monthly") {
    const start = new Date(state.year, state.month - 1, 1);
    const end = new Date(state.year, state.month, 0);
    return { start, end };
  }
  if (state.mode === "quarterly") {
    const q = Math.floor((state.month - 1) / 3);
    const start = new Date(state.year, q * 3, 1);
    const end = new Date(state.year, q * 3 + 3, 0);
    return { start, end };
  }
  if (state.mode === "custom") {
    const start = new Date(state.year, state.month - 1, 1);
    const end = new Date(state.year, state.month - 1, 1);
    return { start, end };
  }
  const start = new Date(state.year, 0, 1);
  const end = new Date(state.year, 11, 31);
  return { start, end };
}