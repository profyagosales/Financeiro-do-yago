import {
    Building2,
    CandlestickChart,
    Coins,
    Landmark,
    PieChart as PieIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    Tooltip as RTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";

import { LineChart as LineIcon } from "@/components/icons";
import { SectionChroming } from "@/components/layout/SectionChroming";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvestments } from "@/hooks/useInvestments";


// Helpers
const BRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const COLORS = ["#0ea5e9", "#22c55e", "#a78bfa", "#f97316"]; // azul, verde, roxo, laranja

type Tab = "all" | "renda_fixa" | "fii" | "acoes" | "cripto";
function tabToType(tab: Tab): "all" | "Renda fixa" | "FIIs" | "Ações" | "Cripto" {
  switch (tab) {
    case "renda_fixa":
      return "Renda fixa";
    case "fii":
      return "FIIs";
    case "acoes":
      return "Ações";
    case "cripto":
      return "Cripto";
    default:
      return "all";
  }
}

export default function InvestimentosResumo() {
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  const { rows, loading, error, kpis, byType, monthly } = useInvestments({
    type: tabToType(tab),
    q,
  });

  // Top 5 ativos (por valor investido agregado)
  const top5 = useMemo(() => {
    const map = new Map<string, { name: string; symbol?: string | null; type: string; total: number }>();
    for (const r of rows) {
      const key = (r.symbol || r.name || "").toUpperCase();
      const total = r.quantity * r.price + (r.fees ?? 0);
      const prev = map.get(key);
      if (prev) prev.total += total;
      else map.set(key, { name: r.name, symbol: r.symbol ?? undefined, type: String(r.type), total });
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [rows]);

  // Últimas operações (somente leitura)
  const latest = useMemo(() => rows.slice(0, 10), [rows]);

  return (
  <SectionChroming clr="invest" decorate className="space-y-6 pb-24">
      <PageHeader
        title="Investimentos — Resumo"
        subtitle="Visão geral dos seus aportes por classe de ativos. Crie e edite nas páginas de Carteira."
        icon={<PieIcon className="h-5 w-5" />}
  breadcrumbs={[{ label: "Investimentos", href: "/investimentos/renda-fixa" }, { label: "Renda Fixa" }]}
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : (
          <>
            <Card>
              <CardHeader className="pb-1">
                <CardDescription>Total investido</CardDescription>
                <CardTitle>{BRL(kpis.total)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardDescription>Operações no mês</CardDescription>
                <CardTitle>{kpis.opsMes}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardDescription>Ativos diferentes</CardDescription>
                <CardTitle>{kpis.ativos}</CardTitle>
              </CardHeader>
            </Card>
          </>
        )}
      </div>

      {/* Filtros (somente leitura) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="renda_fixa">Renda fixa</TabsTrigger>
            <TabsTrigger value="fii">FIIs</TabsTrigger>
            <TabsTrigger value="acoes">Ações</TabsTrigger>
            <TabsTrigger value="cripto">Cripto</TabsTrigger>
          </TabsList>
        </Tabs>

        <Input
          placeholder="Buscar por nome, ticker ou corretora…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="md:w-80"
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="h-4 w-4" /> Distribuição por classe
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : byType.length === 0 ? (
              <EmptyState icon={<PieIcon className="h-6 w-6" />} title="Sem dados" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byType} dataKey="value" nameKey="name" outerRadius={90} innerRadius={60}>
                    {byType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip formatter={(v: any) => BRL(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <LineIcon className="h-4 w-4" /> Aportes nos últimos 12 meses
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : monthly.length === 0 ? (
              <EmptyState icon={<LineIcon className="h-6 w-6" />} title="Sem dados" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => BRL(Number(v)).replace("R$", "")} />
                  <RTooltip formatter={(v: any) => BRL(Number(v))} />
                  <Bar dataKey="total" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTAs para Carteiras */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Landmark className="h-4 w-4" /> Renda Fixa
            </CardTitle>
            <CardDescription>Cadastre e gerencie seus títulos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/investimentos/renda-fixa">Ir para carteira</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> FIIs
            </CardTitle>
            <CardDescription>Fundos Imobiliários.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/investimentos/fiis">Ir para carteira</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CandlestickChart className="h-4 w-4" /> Bolsa
            </CardTitle>
            <CardDescription>Ações e BDRs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/investimentos/bolsa">Ir para carteira</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="h-4 w-4" /> Cripto
            </CardTitle>
            <CardDescription>Criptomoedas e tokens.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/investimentos/cripto">Ir para carteira</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Ativos por valor investido */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top 5 ativos por valor investido</CardTitle>
          <CardDescription>Soma dos aportes por ativo.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-fg-muted">
              <tr>
                <th className="py-2 pr-3">Ativo</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Total investido</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 pr-3" colSpan={3}>
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : top5.length === 0
                ? (
                    <tr>
                      <td colSpan={3}>
                        <EmptyState icon={<PieIcon className="h-6 w-6" />} title="Sem dados" />
                      </td>
                    </tr>
                  )
                : top5.map((a) => (
                    <tr key={(a.symbol || a.name) as string} className="border-t">
                      <td className="py-2 pr-3">
                        <div className="font-medium">{a.name}</div>
                        {a.symbol ? <div className="text-fg-muted">{a.symbol}</div> : null}
                      </td>
                      <td className="py-2 pr-3"><Badge variant="secondary">{a.type}</Badge></td>
                      <td className="py-2 pr-3">{BRL(a.total)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Últimas operações (somente leitura) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Últimas operações</CardTitle>
          <CardDescription>Últimos 10 lançamentos registrados.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-fg-muted">
              <tr>
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Ativo</th>
                <th className="py-2 pr-3">Qtde</th>
                <th className="py-2 pr-3">Preço</th>
                <th className="py-2 pr-3">Taxas</th>
                <th className="py-2 pr-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={7} className="py-2 pr-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td className="py-6 text-red-600" colSpan={7}>{error}</td>
                </tr>
              ) : latest.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={<Coins className="h-6 w-6" />} title="Nenhum registro" />
                  </td>
                </tr>
              ) : (
                latest.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 pr-3">{new Date(r.date).toLocaleDateString("pt-BR")}</td>
                    <td className="py-2 pr-3"><Badge variant="secondary">{String(r.type)}</Badge></td>
                    <td className="py-2 pr-3">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-fg-muted">{r.symbol}</div>
                    </td>
                    <td className="py-2 pr-3">{r.quantity}</td>
                    <td className="py-2 pr-3">{BRL(r.price)}</td>
                    <td className="py-2 pr-3">{BRL(r.fees)}</td>
                    <td className="py-2 pr-3">{BRL(r.quantity * r.price + (r.fees ?? 0))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
  </SectionChroming>
  );
}