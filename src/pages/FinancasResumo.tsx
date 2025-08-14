import { Wallet, TrendingUp, CreditCard } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import KPIStrip, { type KpiItem } from "@/components/dashboard/KPIStrip";

export default function FinancasResumo() {
  const kpis: KpiItem[] = [
    {
      title: "Saldo do mês",
      icon: <Wallet className="size-5" />,
      value: 7532,
      colorFrom: "hsl(var(--chart-emerald))",
      colorTo: "hsl(var(--chart-emerald)/.7)",
      spark: [3200, 3500, 3700, 3800, 3900, 4100],
      sparkColor: "hsl(var(--chart-emerald))",
    },
    {
      title: "Entradas",
      icon: <TrendingUp className="size-5" />,
      value: 12400,
      trend: "up",
      colorFrom: "hsl(var(--chart-blue))",
      colorTo: "hsl(var(--chart-blue)/.7)",
      spark: [3000, 3300, 3600, 3900, 4100, 4300],
      sparkColor: "hsl(var(--chart-blue))",
    },
    {
      title: "Saídas",
      icon: <CreditCard className="size-5" />,
      value: 4868,
      trend: "down",
      colorFrom: "hsl(var(--chart-rose))",
      colorTo: "hsl(var(--chart-amber))",
      spark: [1900, 2100, 1800, 2400, 2000, 2200],
      sparkColor: "hsl(var(--chart-rose))",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finanças — Resumo"
        subtitle="Entradas, saídas e saldo do período."
      />
      <div className="flex justify-end">
        <PeriodSelector />
      </div>
      <KPIStrip items={kpis} />
    </div>
  );
}
