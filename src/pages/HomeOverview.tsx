import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  PiggyBank,
  CalendarRange,
  Landmark,
  Target,
  Plane,
} from "lucide-react";

import Hero from "@/components/dashboard/Hero";
import QuickLinks, { type QuickLink } from "@/components/overview/QuickLinks";
import PageHeader from "@/components/PageHeader";
import KPIStrip, { type KpiItem } from "@/components/dashboard/KPIStrip";
import ForecastChart, { type FluxoItem } from "@/components/dashboard/ForecastChart";
import AlertList, { type AlertItem } from "@/components/dashboard/AlertList";
import InsightCard from "@/components/dashboard/InsightCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePeriod, periodRange } from "@/state/periodFilter";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function HomeOverview() {
  const { mode, month, year } = usePeriod();
  const { start, end } = periodRange({ mode, month, year });
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  const transactions = useMemo(
    () =>
      [
        { date: startDate, amount: 5000 },
        { date: startDate, amount: -2000 },
        { date: endDate, amount: -1000, type: "investment" as const },
      ].filter((t) => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      }),
    [startDate, endDate, start, end]
  );

  const income = useMemo(
    () => transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const expense = useMemo(
    () => transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions]
  );
  const invested = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "investment")
        .reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions]
  );

  const kpis = useMemo<KpiItem[]>(() => {
    if (transactions.length === 0) return [];
    const balance = income - expense;
    return [
      {
        title: "Saldo do período",
        icon: <Wallet className="size-5" />,
        value: balance,
        trend: balance >= 0 ? "up" : "down",
        colorFrom: "hsl(var(--chart-emerald))",
        colorTo: "hsl(var(--chart-teal))",
        spark: Array.from({ length: 8 }, (_, i) => balance + i * 100),
        sparkColor: "hsl(var(--chart-emerald))",
      },
      {
        title: "Entradas",
        icon: <TrendingUp className="size-5" />,
        value: income,
        trend: "up",
        colorFrom: "hsl(var(--chart-blue))",
        colorTo: "hsl(var(--chart-indigo))",
        spark: Array.from({ length: 8 }, (_, i) => income + i * 80),
        sparkColor: "hsl(var(--chart-blue))",
      },
      {
        title: "Saídas",
        icon: <CreditCard className="size-5" />,
        value: expense,
        trend: "down",
        colorFrom: "hsl(var(--chart-rose))",
        colorTo: "hsl(var(--chart-pink))",
        spark: Array.from({ length: 8 }, (_, i) => expense + i * 60),
        sparkColor: "hsl(var(--chart-rose))",
      },
      {
        title: "Investido",
        icon: <PiggyBank className="size-5" />,
        value: invested,
        colorFrom: "hsl(var(--chart-violet))",
        colorTo: "hsl(var(--chart-fuchsia))",
        spark: Array.from({ length: 8 }, (_, i) => invested + i * 50),
        sparkColor: "hsl(var(--chart-violet))",
      },
    ];
  }, [transactions, income, expense, invested]);

  const forecastData = useMemo<FluxoItem[]>(() => {
    const base = [
      { date: "2025-01-01", in: 5000, out: 3200 },
      { date: "2025-02-01", in: 4800, out: 2500 },
      { date: "2025-03-01", in: 5200, out: 3100 },
      { date: "2025-04-01", in: 5100, out: 2900 },
    ];
    return base
      .filter((f) => {
        const d = new Date(f.date);
        return d >= start && d <= end;
      })
      .map((f) => ({
        m: new Date(f.date).toLocaleDateString("pt-BR", { month: "short" }),
        in: f.in,
        out: f.out,
        saldo: f.in - f.out,
      }));
  }, [start, end]);

  const alerts = useMemo<AlertItem[]>(() => {
    const base = [
      { nome: "Internet", vencimento: startDate, valor: 129.9 },
      { nome: "Luz", vencimento: endDate, valor: 220.5 },
    ];
    return base.filter((a) => {
      const d = new Date(a.vencimento);
      return d >= start && d <= end;
    });
  }, [startDate, endDate, start, end]);

  const insights = useMemo(() => {
    const base = [
      {
        date: startDate,
        to: "/financas/mensal",
        icon: <CalendarRange className="h-5 w-5" />,
        title: "Finanças do mês",
        desc: "Entradas, saídas e extratos",
      },
      {
        date: startDate,
        to: "/investimentos/resumo",
        icon: <Landmark className="h-5 w-5" />,
        title: "Investimentos",
        desc: "Carteira e aportes",
      },
      {
        date: startDate,
        to: "/metas",
        icon: <Target className="h-5 w-5" />,
        title: "Metas e projetos",
        desc: "Objetivos em andamento",
      },
      {
        date: startDate,
        to: "/milhas",
        icon: <Plane className="h-5 w-5" />,
        title: "Milhas",
        desc: "Programas e pontos",
      },
    ];
    return base.filter((i) => {
      const d = new Date(i.date);
      return d >= start && d <= end;
    });
  }, [startDate, start, end]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <PageHeader title="Visão geral" />

      <section role="region" aria-labelledby="kpi-heading" className="space-y-4">
        <h2 id="kpi-heading" className="sr-only">
          Indicadores
        </h2>
        {kpis.length ? (
          <KPIStrip items={kpis} />
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <EmptyState icon={<Wallet className="h-8 w-8" />} title="Sem dados" />
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        <motion.section
          variants={item}
          role="region"
          aria-labelledby="forecast-heading"
          className="rounded-xl border border-white/10 bg-white/5 p-6 lg:col-span-8"
        >
          <h2 id="forecast-heading" className="mb-4 font-semibold">
            Fluxo de caixa
          </h2>
          {forecastData.length ? (
            <ForecastChart data={forecastData} />
          ) : (
            <EmptyState icon={<Wallet className="h-8 w-8" />} title="Sem dados" />
          )}
          <Link
            to="/financas/resumo"
            className="mt-4 inline-block text-sm font-medium text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            Ver mais
          </Link>
        </motion.section>

        <motion.section
          variants={item}
          role="region"
          aria-labelledby="alerts-heading"
          className="rounded-xl border border-white/10 bg-white/5 p-6 lg:col-span-4"
        >
          <h2 id="alerts-heading" className="mb-4 font-semibold">
            Próximas contas
          </h2>
          <AlertList items={alerts} />
          <Link
            to="/financas/resumo"
            className="mt-4 inline-block text-sm font-medium text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            Ver mais
          </Link>
        </motion.section>
      </div>

      <section role="region" aria-labelledby="insights-heading">
        <h2 id="insights-heading" className="sr-only">
          Atalhos
        </h2>
        {insights.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
            {insights.map(({ date: _d, ...card }) => (
              <motion.div key={card.title} variants={item} className="lg:col-span-3">
                <InsightCard {...card} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <EmptyState icon={<Wallet className="h-8 w-8" />} title="Nenhum atalho" />
          </div>
        )}
      </section>
    </motion.div>
  );
}

