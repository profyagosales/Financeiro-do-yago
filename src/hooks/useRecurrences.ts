import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

export type Recurrence = {
  description: string;
  amount: number;
  nextDate: string;
};

function normalizeDescription(desc: string) {
  return (desc || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*\(\s*\d+\s*\/\s*\d+\s*\)\s*$/, "")
    .replace(/\d+/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function diffDays(a: string, b: string) {
  const da = Date.parse(a + "T00:00:00Z");
  const db = Date.parse(b + "T00:00:00Z");
  return Math.round((da - db) / 86400000);
}

function addDays(iso: string, days: number) {
  const [Y, M, D] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(Y, M - 1, D + days));
  return d.toISOString().slice(0, 10);
}

function detectRecurrences(rows: Array<{ date: string; amount: number; description: string }>) {
  const groups: Record<string, { name: string; items: { date: string; amount: number }[] }> = {};
  rows.forEach((r) => {
    const norm = normalizeDescription(r.description);
    if (!norm) return;
    if (!groups[norm]) groups[norm] = { name: r.description, items: [] };
    groups[norm].name = r.description; // keep latest description
    groups[norm].items.push({ date: r.date, amount: Number(r.amount) });
  });

  const out: Recurrence[] = [];
  Object.values(groups).forEach((g) => {
    if (g.items.length < 3) return;
    g.items.sort((a, b) => a.date.localeCompare(b.date));
    const diffs: number[] = [];
    for (let i = 1; i < g.items.length; i++) {
      diffs.push(diffDays(g.items[i].date, g.items[i - 1].date));
    }
    if (diffs.length < 2) return;
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const period = Math.round(avg);
    if (!diffs.every((d) => Math.abs(d - period) <= 3)) return;
    const last = g.items[g.items.length - 1];
    const nextDate = addDays(last.date, period);
    const amountAvg = g.items.reduce((a, b) => a + b.amount, 0) / g.items.length;
    out.push({ description: g.name, amount: amountAvg, nextDate });
  });
  return out;
}

export function useRecurrences() {
  const [data, setData] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("date, amount, description")
          .order("date", { ascending: true });
        if (error) throw error;
        const recs = detectRecurrences((data || []) as any[]);
        setData(recs);
      } catch (e: unknown) {
        console.error("[useRecurrences] list error:", e);
        setError(e instanceof Error ? e.message : "Erro ao carregar recorrências");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return { data, loading, error };
}

export type RecurrenceResult = ReturnType<typeof useRecurrences>;

