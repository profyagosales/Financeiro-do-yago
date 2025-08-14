import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  CalendarRange,
  Landmark,
  Target,
  Plane,
  ShoppingCart,
  Heart,
  Bell,
} from "lucide-react";


import Logo from "@/components/Logo";
import KPIBar, { type KPIItem } from "@/components/Overview/KPIBar";
import OverviewChart, { type OverviewPoint } from "@/components/Overview/OverviewChart";
import InsightCard from "@/components/Overview/InsightCard";
import AlertList, { type AlertItem } from "@/components/dashboard/AlertList";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
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

  const kpis = useMemo<KPIItem[]>(() => {
    if (transactions.length === 0) return [];
    const balance = income - expense;
    const rent = invested ? (balance / invested) * 100 : 0;
    return [
      {
        title: "Saldo",
        icon: <Wallet className="size-5" />,
        value: balance,
        spark: Array.from({ length: 8 }, (_, i) => balance + i * 100),
        sparkColor: "hsl(var(--chart-emerald))",
      },
      {
        title: "Gastos do mês",
        icon: <CreditCard className="size-5" />,
        value: expense,
        spark: Array.from({ length: 8 }, (_, i) => expense + i * 60),
        sparkColor: "hsl(var(--chart-rose))",
      },
      {
        title: "Rentabilidade",
        icon: <TrendingUp className="size-5" />,
        value: rent,
        format: "percent",
        spark: Array.from({ length: 8 }, (_, i) => rent + i * 2),
        sparkColor: "hsl(var(--chart-blue))",
      },
      {
        title: "Metas concluídas",
        icon: <Target className="size-5" />,
        value: 0,
        format: "number",
      },
      {
        title: "Alertas",
        icon: <Bell className="size-5" />,
        value: alerts.length,
        format: "number",
      },
    ];
  }, [transactions, income, expense, invested, alerts.length]);

  const forecastData = useMemo<OverviewPoint[]>(() => {
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

  const insights = useMemo(() => {
    return [
      {
        icon: <CalendarRange className="h-5 w-5" />,
        title: "Finanças do mês",
        desc: "Entradas, saídas e extratos",
        link: "/financas/mensal",
      },
      {
        icon: <Landmark className="h-5 w-5" />,
        title: "Investimentos",
        desc: "Carteira e aportes",
        link: "/investimentos/resumo",
      },
      {
        icon: <Target className="h-5 w-5" />,
        title: "Metas atrasadas",
        desc: "Objetivos em andamento",
        link: "/metas",
      },
      {
        icon: <Plane className="h-5 w-5" />,
        title: "Milhas a expirar",
        desc: "Programas e pontos",
        link: "/milhas",
      },
      {
        icon: <Bell className="h-5 w-5" />,
        title: "Alertas",
        desc: `${alerts.length} contas a vencer`,
        link: "/financas/resumo",
      },
    ];
  }, [alerts.length]);

  const heroLinks = [
    { to: "/financas/resumo", label: "Finanças", icon: <Wallet className="h-5 w-5" /> },
    { to: "/metas", label: "Metas", icon: <Target className="h-5 w-5" /> },
    { to: "/milhas", label: "Milhas", icon: <Plane className="h-5 w-5" /> },
    { to: "/compras", label: "Compras", icon: <ShoppingCart className="h-5 w-5" /> },
    { to: "/desejos", label: "Desejos", icon: <Heart className="h-5 w-5" /> },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto w-max"
        >
          <Logo size="lg" />
        </motion.div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {heroLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <PeriodSelector />
        </div>
      </section>

      <section role="region" aria-labelledby="kpi-heading" className="space-y-4">
        <h2 id="kpi-heading" className="sr-only">
          Indicadores
        </h2>
        {kpis.length ? (
          <KPIBar items={kpis} />
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
            <OverviewChart data={forecastData} />
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
            {insights.map((card) => (
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

