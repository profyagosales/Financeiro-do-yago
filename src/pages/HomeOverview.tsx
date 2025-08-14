import { motion } from "framer-motion";
import {
  CalendarRange,
  CreditCard,
  Landmark,
  PieChart as PieChartIcon,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import { Heart, Plane, ShoppingCart, Target, Wallet } from "@/components/icons";
import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Link } from "react-router-dom";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Logo } from "@/components/Logo";
import MetasSummary from "@/components/MetasSummary";
import BalanceForecast from "@/components/dashboard/BalanceForecast";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import InsightBar from "@/components/dashboard/InsightBar";
import ForecastMiniChart from "@/components/dashboard/ForecastMiniChart";
import AlertsDrawer from "@/components/dashboard/AlertsDrawer";
import RecurrenceWidget from "@/components/dashboard/RecurrenceWidget";
import AlertList from "@/components/dashboard/AlertList";
import InsightCard from "@/components/dashboard/InsightCard";
import {
  WidgetCard,
  WidgetFooterAction,
  WidgetHeader,
} from "@/components/dashboard/WidgetCard";
import { useRecurrences } from "@/hooks/useRecurrences";
import { useInsights } from "@/hooks/useInsights";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { usePeriod } from "@/state/periodFilter";
import { KpiCard } from "@/components/financas";


// Garantir decorativos não interativos
// className nos decorativos: "pointer-events-none select-none -z-10 opacity-25"


function monthShortPtBR(n: number) {
  const arr = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return arr[Math.max(1, Math.min(12, n)) - 1];
}



// ---------------------------------- page
export default function HomeOverview() {
  // MOCKs – depois plugamos hooks reais
  const kpis = { saldoMes: 7532, entradasMes: 12400, saidasMes: 4868, investidoTotal: 36250 };

  const base = [
    { m: "Jan", in: 3600, out: 1900 },
    { m: "Fev", in: 4100, out: 2100 },
    { m: "Mar", in: 3800, out: 1800 },
    { m: "Abr", in: 4600, out: 2400 },
    { m: "Mai", in: 4200, out: 2000 },
    { m: "Jun", in: 3900, out: 2200 },
    { m: "Jul", in: 4300, out: 2100 },
    { m: "Ago", in: 4700, out: 2300 },
    { m: "Set", in: 5200, out: 2600 },
    { m: "Out", in: 5400, out: 2500 },
    { m: "Nov", in: 5600, out: 2700 },
    { m: "Dez", in: 6000, out: 2900 },
  ];
  const fluxo = useMemo(() => {
    let acc = 0;
    return base.map((d) => {
      acc += d.in - d.out;
      return { ...d, saldo: acc };
    });
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps -- base is static
  []);

  const sparkIn = base.slice(-8).map((d) => d.in);
  const sparkOut = base.slice(-8).map((d) => d.out);
  const sparkSaldo = fluxo.slice(-8).map((d) => d.saldo);
  const sparkInv = useMemo(() => {
    let inv = 30000;
    return base.slice(-8).map((d) => {
      inv += Math.max(0, d.in - d.out) * 0.35;
      return inv;
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

  const aportesRecentes = [
    { data: "2025-08-03", tipo: "Renda fixa", ativo: "Tesouro Selic 2029", qtd: 1, preco: 550 },
    { data: "2025-08-02", tipo: "FIIs", ativo: "MXRF11", qtd: 100, preco: 10.15 },
    { data: "2025-08-01", tipo: "Ações", ativo: "PETR4", qtd: 20, preco: 38.4 },
    { data: "2025-07-28", tipo: "Cripto", ativo: "BTC", qtd: 0.005, preco: 355000 },
  ];

  const insightMessage = "Você economizou 15% a mais este mês.";
  const forecastData = base.slice(-6).map((d) => ({ month: d.m, in: d.in, out: d.out }));
  const { data: recurrences } = useRecurrences();
  const alerts = [
    { message: "Conta de luz vence em 3 dias" },
    { message: "Orçamento de lazer excedido" },
  ];

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
  );

  const fluxoTitle = `Fluxo de caixa — ${mode === "monthly" ? `${monthShortPtBR(month)} ${year}` : `Ano ${year}`}`;

  const container = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
  };
  const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);
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

          {/* SELECTOR TOP-RIGHT ------------------------------------- */}
          <motion.div variants={item} className="flex justify-end">
            <PeriodSelector />
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

      {/* WIDGETS ----------------------------------------------- */}
      <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={container}>
        <motion.div variants={item}>
          <InsightBar items={insights} isLoading={insightsLoading} />
        </motion.div>
        <motion.div variants={item}>
          <ForecastMiniChart data={forecastData} isLoading={forecastLoading} />
        </motion.div>
        <motion.div variants={item}>

          <RecurrenceList
            items={recurrences.map((r) => ({ name: r.description, amount: r.amount }))}
            onClick={() => setActiveWidget('recurrence')}
          />
        </motion.div>
        <motion.div variants={item}>
          <BalanceForecast current={kpis.saldoMes} forecast={kpis.saldoMes + 1000} />
        </motion.div>
        <motion.div variants={item}>
          <AlertsDrawer alerts={alerts} isLoading={alertsLoading} />
        </motion.div>
      </motion.div>

      {/* GRÁFICOS ---------------------------------------------- */}
      <motion.div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3" variants={container}>
        <motion.div variants={item} className="xl:col-span-2">
          <Card className="h-full overflow-x-auto">
            <CardHeader title={fluxoTitle} subtitle="Entradas, saídas e saldo acumulado" />
            <div className="h-[220px] min-w-[320px]">
              {fluxo.length === 0 ? (
                <EmptyState icon={<Wallet className="h-8 w-8" />} title="Sem dados" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={fluxo}
                    margin={{ top: 8, right: 12, bottom: 0, left: 8 }}
                    barCategoryGap={24}
                    barGap={8}
                  >
                    <defs>
                      <linearGradient id="saldoFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-emerald))" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="hsl(var(--chart-emerald))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="2 4" />
                    <XAxis dataKey="m" tickMargin={8} axisLine={false} tickLine={false} />
                    <YAxis
                      tickFormatter={(v) =>
                        formatCurrency(Number(v)).replace(/^R\$\s?/, "")
                      }
                      width={64}
                      tickMargin={8}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(v: unknown) => formatCurrency(Number(v))}
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--chart-tooltip-bg))',
                        color: 'hsl(var(--chart-tooltip-fg))'
                      }}
                      wrapperStyle={{ outline: 'none' }}
                    />
                    <Bar dataKey="in" fill="hsl(var(--chart-blue))" fillOpacity={0.95} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="out" fill="hsl(var(--chart-rose))" fillOpacity={0.92} radius={[8, 8, 0, 0]} />
                    <Area type="monotone" dataKey="saldo" stroke="hsl(var(--chart-emerald))" fill="url(#saldoFill)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <WidgetCard className="h-full overflow-x-auto">
            <CardHeader title="Distribuição da carteira" subtitle="Por classe de ativos" />
            {carteira.length === 0 ? (
              <EmptyState
                icon={<PieChartIcon className="h-8 w-8" />}
                title="Sem dados"
              />
            ) : (
              <>
                <div className="h-[220px] min-w-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {cores.map((c, i) => (
                          <linearGradient
                            id={`g${i}`}
                            x1="0"
                            x2="1"
                            y1="0"
                            y2="1"
                            key={i}
                          >
                            <stop offset="0%" stopColor={c} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={c} stopOpacity={0.6} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={carteira}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={86}
                        paddingAngle={3}
                        startAngle={90}
                        endAngle={-270}
                        cornerRadius={6}
                        stroke="#ffffff"
                        strokeOpacity={0.85}
                      >
                        {carteira.map((_, i) => (
                          <Cell key={i} fill={`url(#g${i})`} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => formatCurrency(v)}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                        wrapperStyle={{ outline: "none" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {carteira.map((c, i) => (
                    <li key={c.name} className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: cores[i] }}
                      />
                      <span className="text-muted-foreground">{c.name}</span>
                      <span className="ml-auto font-medium">
                        {formatCurrency(c.value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
              </WidgetCard>
          </motion.div>
      </motion.div>

      <motion.div className="grid items-stretch gap-6 xl:grid-cols-3" variants={container}>
        <motion.div variants={item}>
          <WidgetCard className="h-full">
            <WidgetHeader
              title="Próximas contas a vencer"
              subtitle="Próximos 10 dias"
            />
            <AlertList items={contasAVencer} />
            <WidgetFooterAction to="/financas/mensal">Ver detalhes</WidgetFooterAction>
          </WidgetCard>
        </motion.div>

        <motion.div variants={item}>
          <WidgetCard className="h-full">
            <WidgetHeader
              title="Metas em andamento"
              subtitle="Progresso geral"
            />
            <MetasSummary />
            <WidgetFooterAction to="/financas/anual">Ver detalhes</WidgetFooterAction>
        </WidgetCard>
        </motion.div>

        <motion.div variants={item}>
          <WidgetCard className="h-full">
            <WidgetHeader
              title="Aportes recentes"
              subtitle="Últimas 5 operações"
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="w-6 py-2"></th>
                    <th className="py-2 text-left font-medium">Data</th>
                    <th className="py-2 text-left font-medium">Ativo</th>
                    <th className="py-2 text-left font-medium">Classe</th>
                    <th className="py-2 text-right font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100/60 dark:divide-zinc-800/60">
                  {aportesRecentes.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState
                          icon={<TrendingUp className="h-6 w-6" />}
                          title="Sem aportes"
                        />
                      </td>
                    </tr>
                  ) : (
                    aportesRecentes.map((r) => (
                      <tr key={r.data + r.ativo}>
                        <td className="py-2">
                          <BrandIcon name={`${r.ativo} ${r.tipo}`} />
                        </td>
                        <td className="py-2">
                          {new Date(r.data).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-2">{r.ativo}</td>
                        <td className="py-2">{r.tipo}</td>
                        <td className="py-2 text-right font-medium">
                          {formatCurrency(r.preco * (r.qtd || 1))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
      </div>
    )}
  </>
  );
}


// ---------------------------------- partials
function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={`card-surface p-5 sm:p-6 ${className || ""}`}>{children}</div>;
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
    </div>
  );
}
