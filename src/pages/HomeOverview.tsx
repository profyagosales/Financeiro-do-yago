import { motion } from "framer-motion";
import {
    Bell,
    CalendarRange,
    CreditCard,
    Landmark,
    Plane,
    Target,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";


import AlertList, { type AlertItem } from "@/components/dashboard/AlertList";
import { KPIStat } from "@/components/dashboard/KPIStat";
import { SectionChroming } from "@/components/layout/SectionChroming";
import Logo from "@/components/Logo";
import InsightCard from "@/components/overview/InsightCard";
import type { OverviewPoint } from "@/components/overview/OverviewChart";
import { ChartFallback } from '@/components/ui/ChartFallback';
import { EmptyState } from "@/components/ui/EmptyState";
import { periodRange, usePeriod } from "@/state/periodFilter";
import { Suspense, lazy } from 'react';
const OverviewChart = lazy(() => import("@/components/overview/OverviewChart"));

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: ("easeOut" as any) } },
};

// LEGADO: Página antiga de overview (mantida temporariamente até migração completa)
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

  const kpis = useMemo(() => {
    if (transactions.length === 0) return [];
    const balance = income - expense;
    const rent = invested ? (balance / invested) * 100 : 0;
    return [
      {
        label: "Saldo",
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance),
        icon: <Wallet className="size-5" />, tone: 'emerald' as const,
      },
      {
        label: "Gastos do mês",
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense),
        icon: <CreditCard className="size-5" />, tone: 'rose' as const,
      },
      {
        label: "Rentabilidade",
        value: `${rent.toFixed(2)}%`,
        icon: <TrendingUp className="size-5" />, tone: 'blue' as const,
      },
      {
        label: "Metas concluídas",
        value: '0',
        icon: <Target className="size-5" />, tone: 'violet' as const,
      },
      {
        label: "Alertas",
        value: String(alerts.length),
        icon: <Bell className="size-5" />, tone: 'amber' as const,
      },
    ] as const;
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
  link: "/investimentos/renda-fixa",
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

  // heroLinks removido (legacy)

  return (
  <SectionChroming clr="home" decorate className="space-y-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
  {/* LEGACY HERO (será removido após adoção completa do novo dashboard) */}
  <section className="hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto w-max"
        >
          <Logo size="lg" />
        </motion.div>
  {/* mini-cards e seletor de período ocultados */}
      </section>

      <section role="region" aria-labelledby="kpi-heading" className="space-y-4">
        <h2 id="kpi-heading" className="sr-only">
          Indicadores
        </h2>
        {kpis.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {kpis.map(k => (
              <KPIStat key={k.label} {...k} />
            ))}
          </div>
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
            <Suspense fallback={<ChartFallback className="h-52" />}>
              <OverviewChart data={forecastData} />
            </Suspense>
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
                <InsightCard
                  icon={card.icon}
                  title={card.title}
                  subtitle={card.desc}
                  onClick={() => {
                    if (card.link) window.location.href = card.link;
                  }}
                />
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
    </SectionChroming>
  );
}

