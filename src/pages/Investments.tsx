// src/pages/Investments.tsx  (RESUMO)
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import { PieChart as PieIcon } from "lucide-react";

/* ---------------- utils ---------------- */
type Investment = {
  id: number;
  user_id: string;
  type: string;
  name: string;
  symbol: string | null;
  quantity: number;
  price: number;
  fees: number | null;
  broker: string | null;
  date: string;
  note: string | null;
  created_at: string;
};
const COLORS = ["#0ea5e9", "#10b981", "#6366f1", "#f59e0b", "#ef4444"];
const BRL = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const monthKey = (d: string | Date) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
};
const ptMonth = (y: number, m: number) =>
  new Date(y, m, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });

/* ---------------- componente ---------------- */
export default function InvestmentsResumo() {
  const { user } = useAuth() as { user: { id: string } | null };
  const [items, setItems] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"Todos" | "Renda fixa" | "FIIs" | "Ações" | "Cripto" | "Outros">("Todos");
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("investments")
          .select("*")
          .order("date", { ascending: true });
        if (error) throw error;
        setItems((data || []) as Investment[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const filtered = useMemo(() => {
    const byType = tab === "Todos" ? items : items.filter((i) => (i.type || "Outros") === tab);
    const t = q.trim().toLowerCase();
    if (!t) return byType;
    return byType.filter((i) =>
      [i.name, i.symbol, i.broker, i.type].some((v) => (v || "").toLowerCase().includes(t))
    );
  }, [items, tab, q]);

  const kpis = useMemo(() => {
    const invested = filtered.reduce((s, it) => s + it.quantity * it.price + (it.fees ?? 0), 0);
    const ops = filtered.length;
    const ativos = new Set(filtered.map((it) => (it.symbol || it.name).toUpperCase())).size;
    return { invested, ops, ativos };
  }, [filtered]);

  const byType = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((it) => {
      const key = it.type || "Outros";
      const val = it.quantity * it.price + (it.fees ?? 0);
      map.set(key, (map.get(key) || 0) + val);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const last12 = useMemo(() => {
    const base = new Date(); base.setDate(1);
    const keys = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(base); d.setMonth(d.getMonth() - (11 - i));
      return monthKey(d);
    });
    const sums = new Map(keys.map((k) => [k, 0]));
    items.forEach((it) => {
      const k = monthKey(it.date);
      if (sums.has(k)) sums.set(k, (sums.get(k) || 0) + it.quantity * it.price + (it.fees ?? 0));
    });
    return keys.map((k) => {
      const [y, m] = k.split("-").map(Number);
      return { month: ptMonth(y, m - 1), valor: sums.get(k) || 0 };
    });
  }, [items]);

  return (
    <>
      <PageHeader
        title="Investimentos"
        subtitle="Acompanhe seus aportes e a distribuição por classe. (Resumo geral)"
        icon={<PieIcon className="h-5 w-5" />}
      />

      {/* Filtros topo */}
      <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
          <TabsList>
            <TabsTrigger value="Todos">Todos</TabsTrigger>
            <TabsTrigger value="Renda fixa">Renda fixa</TabsTrigger>
            <TabsTrigger value="FIIs">FIIs</TabsTrigger>
            <TabsTrigger value="Ações">Ações</TabsTrigger>
            <TabsTrigger value="Cripto">Cripto</TabsTrigger>
            <TabsTrigger value="Outros">Outros</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-full md:w-80">
          <Input placeholder="Buscar por nome, ticker ou corretora…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardDescription>Total investido</CardDescription>
            <CardTitle className="text-2xl">{BRL(kpis.invested)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardDescription>Operações no período</CardDescription>
            <CardTitle className="text-2xl">{kpis.ops}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardDescription>Ativos diferentes</CardDescription>
            <CardTitle className="text-2xl">{kpis.ativos}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader><CardTitle>Distribuição por classe</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {byType.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sem dados.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byType} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                    {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v: any) => BRL(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle>Aportes nos últimos 12 meses</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last12}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickMargin={8} />
                <YAxis tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                <Tooltip formatter={(v: any) => BRL(Number(v))} />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {!loading && items.length === 0 && (
        <Card className="mt-6 p-6">
          <CardTitle className="text-base">Nenhum dado ainda</CardTitle>
          <CardDescription>Cadastre seus aportes nas páginas de Carteira (Renda fixa, FIIs, Ações, Cripto).</CardDescription>
        </Card>
      )}
    </>
  );
}