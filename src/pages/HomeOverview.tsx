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
import QuickLinks, { type QuickLink } from "@/components/overview/QuickLinks";
import KPIStrip, { type KpiItem } from "@/components/overview/KPIStrip";
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
  }, []);


  const carteira = [
    { name: "Renda fixa", value: 14800 },
    { name: "FIIs", value: 8200 },
    { name: "Ações", value: 9800 },
    { name: "Cripto", value: 1450 },
  ];
  const cores = [
    "hsl(var(--chart-emerald))",
    "hsl(var(--chart-violet))",
    "hsl(var(--chart-blue))",
    "hsl(var(--chart-amber))",
  ];

  const contasAVencer = [
    { nome: "Internet", vencimento: "2025-08-12", valor: 129.9 },
    { nome: "Luz", vencimento: "2025-08-14", valor: 220.5 },
    { nome: "Cartão Nubank", vencimento: "2025-08-16", valor: 830.0 },
  ];

  const insightMessage = "Você economizou 15% a mais este mês.";
  const forecastData = base.slice(-6).map((d) => ({ month: d.m, in: d.in, out: d.out }));
  const { data: recurrences } = useRecurrences();
  const alerts = [
    { message: "Conta de luz vence em 3 dias" },
    { message: "Orçamento de lazer excedido" },
  ];

  const { data: goals } = useGoals();
  const metasItems = useMemo(
    () =>
      [...goals]
        .sort((a, b) => (b.progress_pct || 0) - (a.progress_pct || 0))
        .slice(0, 3)
        .map((g) => ({ label: g.title, value: g.progress_pct || 0, total: 100 })),
    [goals]
  );
  const investItems = useMemo(
    () =>
      carteira.map((c) => ({ label: c.name, value: c.value, total: kpis.investidoTotal })),
    [carteira, kpis.investidoTotal]
  );

  const shortcuts = [
    {
      title: "Finanças",
      subtitle: "Entradas e saídas",
      icon: CreditCard,
      href: "/financas/resumo",
    },
    {
      title: "Investimentos",
      subtitle: "Carteira e aportes",
      icon: PieChartIcon,
      href: "/investimentos/resumo",
    },
    {
      title: "Metas & Projetos",
      subtitle: "Objetivos em progresso",
      icon: Target,
      href: "/metas",
    },
    {
      title: "Milhas",
      subtitle: "Programas e pontos",
      icon: Plane,
      href: "/milhas",
    },
    {
      title: "Desejos",
      subtitle: "Itens que quero",
      icon: Heart,
      href: "/desejos",
    },
    {
      title: "Lista de compras",
      subtitle: "Planejar aquisições",
      icon: ShoppingCart,
      href: "/compras",
    },
  ];

  const kpiItems = [
    {
      title: "Saldo do mês",
      icon: <Wallet className="size-5" />,
      value: kpis.saldoMes,
      delta: 320,
    },
    {
      title: "Entradas",
      icon: <TrendingUp className="size-5" />,
      value: kpis.entradasMes,
      delta: 120,
    },
    {
      title: "Saídas",
      icon: <CreditCard className="size-5" />,
      value: kpis.saidasMes,
      delta: -80,
    },
    {
      title: "Investido total",
      icon: <PiggyBank className="size-5" />,
      value: kpis.investidoTotal,
    },
  ];

  const { mode, month, year } = usePeriod();
  const insights = useInsights(
    { year, month },
    {
      transactions: [],
      categories: [],
      bills: contasAVencer.map((c, i) => ({
        id: String(i),
        description: c.nome,
        amount: c.valor,
        due_date: c.vencimento,
        paid: false,
        account_id: null,
        card_id: null,
        category_id: null,
      })),
      goals: [],
      miles: [],
    }
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
    <>
      <motion.div
        key={`${mode}-${month}-${year}`}
        className="space-y-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
          {/* HERO --------------------------------------------------- */}
          <motion.div variants={item}>
            <div className="hero-gradient relative overflow-hidden rounded-2xl border border-white/15 p-8 text-neutral-100 shadow-lg">
              <div className="grid gap-8 md:grid-cols-2 md:items-center">
                <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
                  <Logo size="lg" />
                  <h1 className="text-3xl font-bold tracking-tight">Financeiro do Yago</h1>
                </div>
                <motion.div className="grid grid-cols-2 gap-4 sm:grid-cols-3" variants={container}>
                  {shortcuts.map(({ title, subtitle, icon: Icon, href }) => (
                    <motion.div key={title} variants={item}>
                      <Link
                        to={href}
                        className="glass group block rounded-xl p-4 shadow-sm transition hover:scale-[1.01]"
                      >
                        <Icon className="mb-2 h-6 w-6 text-neutral-200" />
                        <div className="font-medium tracking-wide text-neutral-200">{title}</div>
                        <div className="text-sm tracking-wide text-neutral-400">{subtitle}</div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* KPIs --------------------------------------------------- */}
          <motion.div
            className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4"
            variants={container}
          >
            {kpiItems.map((k) => (
              <motion.div key={k.title} variants={item}>
                <KpiCard {...k} isLoading={loading} />
              </motion.div>
            ))}
          </motion.div>
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

        <motion.div variants={item}>
          <WidgetCard className="h-full">
            <WidgetHeader
              title="Investimentos por classe"
              subtitle="Participação no total"
            />
            <ProgressList items={investItems} />
            <WidgetFooterAction to="/investimentos/resumo">Ver detalhes</WidgetFooterAction>
          </WidgetCard>
        </motion.div>
      </motion.div>


      {/* ACESSOS RÁPIDOS ---------------------------------------- */}
      <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" variants={container}>
        <motion.div variants={item}>
          <InsightCard
            to="/financas/mensal"
            icon={<CalendarRange className="h-5 w-5" />}
            title="Finanças do mês"
            desc="Entradas, saídas e extratos"
          />
        </motion.div>
        <motion.div variants={item}>
          <InsightCard
            to="/investimentos/resumo"
            icon={<Landmark className="h-5 w-5" />}
            title="Resumo de investimentos"
            desc="Distribuição e aportes"
          />
        </motion.div>
        <motion.div variants={item}>
          <InsightCard
            to="/metas"
            icon={<Target className="h-5 w-5" />}
            title="Metas e projetos"
            desc="Progresso e cronograma"
          />
        </motion.div>
        <motion.div variants={item}>
          <InsightCard
            to="/milhas/livelo"
            icon={<Plane className="h-5 w-5" />}
            title="Milhas e pontos"
            desc="Livelo, Latam Pass, Azul"
          />
        </motion.div>
      </motion.div>
    </motion.div>

    {activeWidget && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={() => setActiveWidget(null)}
      >
        <div
          className="rounded-xl bg-white p-4 shadow-lg dark:bg-zinc-900"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-2 font-semibold">Widget: {activeWidget}</p>
          <button
            className="mt-2 rounded bg-emerald-600 px-3 py-1 text-sm text-neutral-100"
            onClick={() => setActiveWidget(null)}
          >
            Fechar
          </button>
        </div>
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
