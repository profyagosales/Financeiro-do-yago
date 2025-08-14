import dayjs from 'dayjs';
import { useMemo } from 'react';

import type { MilesProgram } from '@/components/MilesHeader';

export type MilesPending = {
  id: string;
  program: MilesProgram;
  partner: string;
  points: number;
  expected_at: string; // YYYY-MM-DD
};

// Dados mockados; integração futura com backend/Supabase
const MOCK: MilesPending[] = [
  {
    id: '1',
    program: 'livelo',
    partner: 'Compra Loja X',
    points: 500,
    expected_at: dayjs().add(10, 'day').format('YYYY-MM-DD'),
  },
  {
    id: '2',
    program: 'latam',
    partner: 'Cartão de crédito',
    points: 1000,
    expected_at: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  },
  {
    id: '3',
    program: 'azul',
    partner: 'Hotel',
    points: 800,
    expected_at: dayjs().add(20, 'day').format('YYYY-MM-DD'),
  },
];

export default function MilesPendingList({ program }: { program?: MilesProgram }) {
  const itens = useMemo(() => MOCK.filter((m) => !program || m.program === program), [program]);
  const colSpan = program ? 3 : 4;

  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
      <h3 className="font-medium mb-3">A receber</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              {!program && <th className="py-2">Programa</th>}
              <th className="py-2">Origem</th>
              <th>Pontos</th>
              <th>Previsto</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((m) => (
              <tr key={m.id} className="border-t">
                {!program && <td className="py-2 capitalize">{m.program}</td>}
                <td className="py-2">{m.partner}</td>
                <td>{m.points}</td>
                <td>{dayjs(m.expected_at).format('DD/MM/YYYY')}</td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="py-10 text-center text-slate-500">
                  Sem pendências.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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
  const [rows, setRows] = useState<MileRow[] | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [user?.id, program]);

  async function markPosted(id: number) {
    const { error } = await supabase
      .from("miles")
      .update({ status: "posted", posted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Milhas marcadas como creditadas");
      setRows((prev) => (prev ?? []).filter((r) => r.id !== id));
    }
  }

  const total = useMemo(
    () => (rows ?? []).reduce((acc, r) => acc + (r.amount ?? 0), 0),
    [rows]
  );

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-medium">
          A receber {program ? `— ${program === "livelo" ? "Livelo" : program === "latampass" ? "LATAM Pass" : "Azul"}` : ""}
        </div>
        <div className="text-sm text-muted-foreground">Total: {total.toLocaleString("pt-BR")} pts</div>
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Carregando…</div>
      ) : !rows?.length ? (
        <div className="text-sm text-muted-foreground">Nenhum lançamento pendente.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 text-left">Programa</th>
                <th className="py-2 text-right">Quantidade</th>
                <th className="py-2 text-left">Disponível em</th>
                <th className="py-2 text-center">Dias</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const d = r.expected_at ? dayjs(r.expected_at) : null;
                const diff = d ? d.diff(dayjs(), "day") : null;
                const diffLabel =
                  diff === null ? "—" : diff === 0 ? "hoje" : diff > 0 ? `${diff}d` : `${diff}d`;
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
                    <td className="py-2 capitalize">{r.program}</td>
                    <td className="py-2 text-right">{r.amount.toLocaleString("pt-BR")}</td>
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
          </table>
        </div>
      )}
    </Card>
  );
}

