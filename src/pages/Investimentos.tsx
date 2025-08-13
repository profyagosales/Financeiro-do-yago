import { useMemo } from "react";
import dayjs from "dayjs";
import {
  PieChart as PieIcon,
  LineChart as LineIcon,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useInvestments } from "@/hooks/useInvestments";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";

const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const COLORS = ["#0ea5e9", "#22c55e", "#a78bfa", "#f97316"];

export default function InvestimentosResumo() {
  const { history, byType, loading } = useInvestments();

  const aporteMes = useMemo(() => {
    const start = dayjs().startOf("month");
    return history
      .filter((r) => dayjs(r.date).isSame(start, "month"))
      .reduce((s, r) => s + r.total, 0);
  }, [history]);

  const patrimonio = useMemo(
    () => history.reduce((s, r) => s + r.total, 0),
    [history]
  );

  const variacao = useMemo(() => {
    const start = dayjs().startOf("month");
    const prev = history
      .filter((r) => dayjs(r.date).isBefore(start))
      .reduce((s, r) => s + r.total, 0);
    return prev ? ((patrimonio - prev) / prev) * 100 : 0;
  }, [history, patrimonio]);

  const latest = useMemo(() => history.slice(0, 5), [history]);

  const patrimonioSeries = useMemo(() => {
    const base = dayjs().startOf("month").subtract(11, "month");
    const seq = Array.from({ length: 12 }).map((_, i) => base.add(i, "month"));
    let acc = 0;
    return seq.map((d) => {
      const monthly = history
        .filter((r) => dayjs(r.date).isSame(d, "month"))
        .reduce((s, r) => s + r.total, 0);
      acc += monthly;
      return { month: d.format("MMM/YY"), total: acc };
    });
  }, [history]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investimentos — Resumo"
        subtitle="Visão geral dos seus aportes."
        icon={<PieIcon className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Investimentos", href: "/investimentos" },
          { label: "Resumo" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="pb-1">
                <CardDescription>Aporte no mês</CardDescription>
                <CardTitle>{BRL(aporteMes)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardDescription>Patrimônio</CardDescription>
                <CardTitle>{BRL(patrimonio)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-1">
                <CardDescription>Variação %</CardDescription>
                <CardTitle>{variacao.toFixed(2)}%</CardTitle>
              </CardHeader>
            </Card>
          </>
        )}
      </div>

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
                  <Pie data={byType} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
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
              <LineIcon className="h-4 w-4" /> Evolução do patrimônio
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : patrimonioSeries.every((p) => p.total === 0) ? (
              <EmptyState icon={<LineIcon className="h-6 w-6" />} title="Sem dados" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patrimonioSeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => BRL(Number(v)).replace("R$", "")} />
                  <RTooltip formatter={(v: any) => BRL(Number(v))} />
                  <Area type="monotone" dataKey="total" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Últimos aportes</CardTitle>
          <CardDescription>Registros mais recentes.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Ativo</th>
                <th className="py-2 pr-3">Qtde</th>
                <th className="py-2 pr-3">Preço</th>
                <th className="py-2 pr-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={6} className="py-2 pr-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : latest.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="Nenhum registro" />
                  </td>
                </tr>
              ) : (
                latest.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2 pr-3">{dayjs(r.date).format('DD/MM/YY')}</td>
                    <td className="py-2 pr-3"><Badge variant="secondary">{String(r.type)}</Badge></td>
                    <td className="py-2 pr-3">{r.name}</td>
                    <td className="py-2 pr-3">{r.quantity}</td>
                    <td className="py-2 pr-3">{BRL(r.price)}</td>
                    <td className="py-2 pr-3">{BRL(r.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
