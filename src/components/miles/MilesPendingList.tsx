import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Program = "livelo" | "latampass" | "azul";

type MileRow = {
  id: number;
  user_id: string;
  program: Program;
  amount: number;
  expected_at: string | null;
  status: "pending" | "posted" | "expired";
  transaction_id: number | null;
};

export default function MilesPendingList({ program }: { program?: Program }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<MileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, program]);

  async function load() {
    if (!user) return;
    setLoading(true);
    let q = supabase
      .from("miles")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("expected_at", { ascending: true, nullsFirst: false });
    if (program) q = q.eq("program", program);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  }

  async function markPosted(id: number) {
    const { error } = await supabase
      .from("miles")
      .update({ status: "posted", posted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Milhas marcadas como creditadas");
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  }

  const grouped = useMemo(() => {
    const groups: Record<string, MileRow[]> = {};
    rows.forEach((r) => {
      const key = r.expected_at ? dayjs(r.expected_at).format("YYYY-MM") : "sem-data";
      (groups[key] = groups[key] || []).push(r);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  const total = useMemo(() => rows.reduce((acc, r) => acc + (r.amount ?? 0), 0), [rows]);

  const colSpan = program ? 4 : 5;

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-medium">
          A receber
          {program
            ? ` — ${
                program === "livelo"
                  ? "Livelo"
                  : program === "latampass"
                  ? "LATAM Pass"
                  : "Azul"
              }`
            : ""}
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {total.toLocaleString("pt-BR")} pts
        </div>
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : !rows.length ? (
        <div className="text-sm text-muted-foreground">Nenhum lançamento pendente.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                {!program && <th className="py-2 text-left">Programa</th>}
                <th className="py-2 text-right">Quantidade</th>
                <th className="py-2 text-left">Disponível em</th>
                <th className="py-2 text-center">Dias</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            {grouped.map(([month, items]) => (
              <tbody key={month}>
                <tr className="border-b bg-muted/50">
                  <td colSpan={colSpan} className="py-2 font-medium">
                    {month === "sem-data"
                      ? "Sem data"
                      : dayjs(month + "-01").format("MMMM [de] YYYY")}
                  </td>
                </tr>
                {items.map((r) => {
                  const d = r.expected_at ? dayjs(r.expected_at) : null;
                  const diff = d ? d.diff(dayjs(), "day") : null;
                  const diffLabel = diff === null ? "—" : diff === 0 ? "hoje" : `${diff}d`;
                  const diffClass =
                    diff === null
                      ? "text-muted-foreground"
                      : diff < 0
                      ? "text-red-500"
                      : diff <= 3
                      ? "text-amber-500"
                      : "text-emerald-500";
                  return (
                    <tr key={r.id} className="border-b last:border-none">
                      {!program && <td className="py-2 capitalize">{r.program}</td>}
                      <td className="py-2 text-right">
                        {r.amount.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2">
                        {r.expected_at ? dayjs(r.expected_at).format("DD/MM/YYYY") : "—"}
                      </td>
                      <td className={`py-2 text-center font-medium ${diffClass}`}>{diffLabel}</td>
                      <td className="py-2 text-right">
                        <Button size="sm" onClick={() => markPosted(r.id)}>
                          Marcar como creditado
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      )}
    </Card>
  );
}

