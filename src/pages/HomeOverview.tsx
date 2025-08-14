import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  PiggyBank,
  Plane,
  Target,
  Landmark,
  TrendingUp,
  Wallet,
  Heart,
  ShoppingCart,
} from "lucide-react";

import Hero from "@/components/dashboard/Hero";
import QuickLinks, { type QuickLink } from "@/components/dashboard/QuickLinks";
import KPIStrip, { type KpiItem } from "@/components/dashboard/KPIStrip";
import InsightCard from "@/components/dashboard/InsightCard";
import ForecastChart, { type FluxoItem } from "@/components/dashboard/ForecastChart";
import AlertList, { type AlertItem } from "@/components/dashboard/AlertList";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import { WidgetCard, WidgetHeader, WidgetFooterAction } from "@/components/dashboard/WidgetCard";
import { usePeriod } from "@/state/periodFilter";

export default function HomeOverview() {
  const { month, year } = usePeriod();

  const kpis: KpiItem[] = useMemo(() => {
    const base = month * 100;
    return [
      {
        title: "Saldo do mês",
        icon: <Wallet className="size-5" />,
        value: 5000 + base,
        trend: base % 200 > 100 ? "up" : "down",
        colorFrom: "hsl(var(--chart-emerald))",
        colorTo: "hsl(var(--chart-teal))",
        spark: Array.from({ length: 8 }, (_, i) => 4000 + base + i * 100),
        sparkColor: "hsl(var(--chart-emerald))",
      },
      {
        title: "Entradas",
        icon: <TrendingUp className="size-5" />,
        value: 8000 + base,
        trend: "up",
        colorFrom: "hsl(var(--chart-blue))",
        colorTo: "hsl(var(--chart-indigo))",
        spark: Array.from({ length: 8 }, (_, i) => 3000 + base + i * 80),
        sparkColor: "hsl(var(--chart-blue))",
      },
      {
        title: "Saídas",
        icon: <CreditCard className="size-5" />,
        value: 3000 + base,
        trend: "down",
        colorFrom: "hsl(var(--chart-rose))",
        colorTo: "hsl(var(--chart-pink))",
        spark: Array.from({ length: 8 }, (_, i) => 1500 + base + i * 60),
        sparkColor: "hsl(var(--chart-rose))",
      },
      {
        title: "Investido total",
        icon: <PiggyBank className="size-5" />,
        value: 20000 + base,
        colorFrom: "hsl(var(--chart-violet))",
        colorTo: "hsl(var(--chart-fuchsia))",
        spark: Array.from({ length: 8 }, (_, i) => 18000 + base + i * 150),
        sparkColor: "hsl(var(--chart-violet))",
      },
    ];
  }, [month, year]);

  const forecastData: FluxoItem[] = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const data = months.map((m, idx) => {
      const inValue = 3000 + month * 100 + idx * 200;
      const outValue = 1500 + month * 60 + idx * 100;
      const saldo = inValue - outValue;
      return { m, in: inValue, out: outValue, saldo };
    });
    return data.slice(0, month);
  }, [month, year]);

  const alerts: AlertItem[] = useMemo(
    () => [
      { nome: "Conta de luz", vencimento: `${year}-${String(month).padStart(2, "0")}-10`, valor: 200 },
      { nome: "Internet", vencimento: `${year}-${String(month).padStart(2, "0")}-15`, valor: 120 },
    ],
    [month, year]
  );

  const links: QuickLink[] = [
    { title: "Finanças", icon: <CreditCard className="h-5 w-5" />, href: "/financas/resumo" },
    { title: "Investimentos", icon: <Landmark className="h-5 w-5" />, href: "/investimentos/resumo" },
    { title: "Metas", icon: <Target className="h-5 w-5" />, href: "/metas" },
    { title: "Milhas", icon: <Plane className="h-5 w-5" />, href: "/milhas" },
    { title: "Desejos", icon: <Heart className="h-5 w-5" />, href: "/desejos" },
    { title: "Compras", icon: <ShoppingCart className="h-5 w-5" />, href: "/compras" },
  ];

  return (
    <motion.div key={`${month}-${year}`} className="space-y-8">
      <Hero />

      <QuickLinks items={links} />

      <div className="flex justify-end">
        <PeriodSelector />
      </div>

      <KPIStrip items={kpis} />

      <div className="grid gap-6 md:grid-cols-2">
        <WidgetCard>
          <WidgetHeader title="Fluxo de caixa" subtitle="Entradas x saídas" />
          <ForecastChart data={forecastData} />
          <WidgetFooterAction to="/financas/resumo">Ver mais</WidgetFooterAction>
        </WidgetCard>

        <WidgetCard>
          <WidgetHeader title="Próximas contas" subtitle="Próximos 10 dias" />
          <AlertList items={alerts} />
          <WidgetFooterAction to="/financas/resumo">Ver mais</WidgetFooterAction>
        </WidgetCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InsightCard
          to="/metas"
          icon={<Target className="h-5 w-5" />}
          title="Metas e projetos"
          desc="Acompanhe seu progresso"
        />
        <InsightCard
          to="/milhas"
          icon={<Plane className="h-5 w-5" />}
          title="Milhas e pontos"
          desc="Programas ativos"
        />
      </div>
    </motion.div>
  );
}
