import { useMemo, useState } from "react";

import dayjs from "dayjs";
import { CandlestickChart, Plus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar } from "recharts";

import ModalInvestimento from "@/components/ModalInvestimento";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useInvestments } from "@/hooks/useInvestments";

const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const COLORS = ["#0ea5e9", "#22c55e", "#a78bfa", "#f97316"];

export default function CarteiraBolsa() {
  const [period, setPeriod] = useState(dayjs().format("YYYY-MM"));
  const [open, setOpen] = useState(false);
  const [year, month] = period
    ? [Number(period.split("-")[0]), Number(period.split("-")[1])]
    : [undefined, undefined];
  const { positions, add, loading } = useInvestments({ type: "Ações", month, year });

  const keys = positions.map((p) => p.symbol || p.name);
  const chartData = useMemo(() => {
    const obj: any = {};
    positions.forEach((p) => {
      obj[p.symbol || p.name] = p.percent;
    });
    return [obj];
  }, [positions]);

  const onCreate = async (d: any) => {
    await add({
      type: "Ações",
      name: d.asset,
      symbol: d.asset,
      quantity: d.quantity,
      price: d.price,
      date: d.date,
      fees: 0,
    });
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Carteira — Bolsa"
        subtitle="Posições consolidadas desta classe."
        icon={<CandlestickChart className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Investimentos", href: "/investimentos" },
          { label: "Carteira", href: "/investimentos/bolsa" },
          { label: "Bolsa" },
        ]}
        actions={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Adicionar investimento
          </Button>
        }
      />

      <div className="mt-4">
        <Input
          type="month"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-40"
        />
      </div>

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Distribuição</CardTitle>
        </CardHeader>
        <CardContent className="h-16">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} stackOffset="expand">
                {keys.map((k, i) => (
                  <Bar key={k} dataKey={k} stackId="a" fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 overflow-x-auto">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 px-3">Ticker</th>
                <th className="py-2 px-3">Nome</th>
                <th className="py-2 px-3">Qtde</th>
                <th className="py-2 px-3">Preço médio</th>
                <th className="py-2 px-3">Preço atual</th>
                <th className="py-2 px-3">P/L</th>
                <th className="py-2 px-3">% carteira</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-4 px-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : positions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-muted-foreground">
                    Sem posições
                  </td>
                </tr>
              ) : (
                positions.map((p) => {
                  const pl = (p.currentPrice - p.avgPrice) * p.quantity;
                  const plPct = p.avgPrice
                    ? ((p.currentPrice - p.avgPrice) / p.avgPrice) * 100
                    : 0;
                  return (
                    <tr key={p.name} className="border-t">
                      <td className="py-2 px-3">{p.symbol || p.name}</td>
                      <td className="py-2 px-3">{p.name}</td>
                      <td className="py-2 px-3">{p.quantity}</td>
                      <td className="py-2 px-3">{BRL(p.avgPrice)}</td>
                      <td className="py-2 px-3">{BRL(p.currentPrice)}</td>
                      <td className="py-2 px-3">
                        {BRL(pl)} ({plPct.toFixed(2)}%)
                      </td>
                      <td className="py-2 px-3">{p.percent.toFixed(2)}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ModalInvestimento
        open={open}
        onClose={() => setOpen(false)}
        defaultType="Ações"
        onSubmit={onCreate}
      />
    </>
  );
}
