import { useEffect, useMemo, useState, type ReactNode, type PropsWithChildren } from 'react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  CreditCard,
  PieChart as PieChartIcon,
  CalendarRange,
  Landmark,
  Target,
  Plane,
  ChevronRight,
} from "lucide-react";

import FilterBar from "@/components/FilterBar";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import { usePeriod } from "@/state/periodFilter";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import HeroSection from "@/components/dashboard/HeroSection";
import KPIStrip, { type KpiItem } from "@/components/dashboard/KPIStrip";
import ForecastChart from "@/components/dashboard/ForecastChart";
import AlertList from "@/components/dashboard/AlertList";
import InsightCard from "@/components/dashboard/InsightCard";
import {
  WidgetCard,
  WidgetHeader,
  WidgetFooterAction,
} from "@/components/dashboard/WidgetCard";
import { useOverviewData } from "@/hooks/useOverviewData";
import { usePeriod } from "@/state/periodFilter";
import { formatCurrency } from "@/lib/utils";
import MetasSummary from "@/components/MetasSummary";
import InsightCard from "@/components/dashboard/InsightCard";
import ForecastChart from "@/components/dashboard/ForecastChart";
import RecurrenceList from "@/components/dashboard/RecurrenceList";
import BalanceForecast from "@/components/dashboard/BalanceForecast";
import AlertList from "@/components/dashboard/AlertList";


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
export default function Dashboard() {
  // MOCKs – depois plugamos hooks reais
  const kpis = { saldoMes: 7532, entradasMes: 12400, saidasMes: 4868, investidoTotal: 36250 };
  const mockData = [
    {
      icon: Wallet,
      label: "Saldo do mês",
      value: formatCurrency(kpis.saldoMes),
      comparison: "+12% vs mês anterior",
      tooltip: "Saldo total após entradas e saídas do mês.",
    },
    {
      icon: TrendingUp,
      label: "Entradas",
      value: formatCurrency(kpis.entradasMes),
      comparison: "+8% vs mês anterior",
      tooltip: "Entradas de dinheiro no mês.",
    },
    {
      icon: CreditCard,
      label: "Saídas",
      value: formatCurrency(kpis.saidasMes),
      comparison: "-5% vs mês anterior",
      tooltip: "Saídas de dinheiro no mês.",
    },
    {
      icon: PiggyBank,
      label: "Investido total",
      value: formatCurrency(kpis.investidoTotal),
      comparison: "+2% vs mês anterior",
      tooltip: "Total aplicado em investimentos.",
    },
    {
      icon: Landmark,
      label: "Patrimônio líquido",
      value: formatCurrency(94850),
      comparison: "+4% vs mês anterior",
      tooltip: "Valor total dos ativos menos passivos.",
    },
    {
      icon: Plane,
      label: "Milhas",
      value: "45k",
      comparison: "+3% vs mês anterior",
      tooltip: "Milhas acumuladas em programas de fidelidade.",
    },
  ];

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
  const recurrences = [
    { name: "Aluguel", amount: 1500 },
    { name: "Academia", amount: 90 },
    { name: "Internet", amount: 120 },
  ];
  const alerts = [
    { message: "Conta de luz vence em 3 dias" },
    { message: "Orçamento de lazer excedido" },
  ];

  const { mode, month, year } = usePeriod();

  const fluxoTitle = `Fluxo de caixa — ${mode === "monthly" ? `${monthShortPtBR(month)} ${year}` : `Ano ${year}`}`;

  const container = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
  };
  const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[136px] w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const kpiItems: KpiItem[] = [
    {
      title: "Saldo do mês",
      icon: <Wallet className="size-5" />,
      colorFrom: "hsl(var(--chart-emerald))",
      colorTo: "hsl(var(--chart-emerald)/.7)",
      value: kpis.saldoMes,
      spark: sparkSaldo,
      sparkColor: "hsl(var(--chart-emerald))",
    },
    {
      title: "Entradas",
      icon: <TrendingUp className="size-5" />,
      colorFrom: "hsl(var(--chart-blue))",
      colorTo: "hsl(var(--chart-blue)/.7)",
      value: kpis.entradasMes,
      trend: "up",
      spark: sparkIn,
      sparkColor: "hsl(var(--chart-blue))",
    },
    {
      title: "Saídas",
      icon: <CreditCard className="size-5" />,
      colorFrom: "hsl(var(--chart-rose))",
      colorTo: "hsl(var(--chart-amber))",
      value: kpis.saidasMes,
      trend: "down",
      spark: sparkOut,
      sparkColor: "hsl(var(--chart-rose))",
    },
    {
      title: "Investido total",
      icon: <PiggyBank className="size-5" />,
      colorFrom: "hsl(var(--chart-violet))",
      colorTo: "hsl(var(--chart-blue))",
      value: kpis.investidoTotal,
      spark: sparkInv,
      sparkColor: "hsl(var(--chart-violet))",
    },
  ];

  return (
    <motion.div

      key={`${mode}-${month}-${year}`}
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >

      {/* HERO --------------------------------------------------- */}
      <motion.div variants={item}>
        <HeroSection />
      </motion.div>


    <>
      <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
        {/* HERO --------------------------------------------------- */}
        <motion.div variants={item}>
          <HeroHeader />
        </motion.div>

      {/* SELECTOR TOP-RIGHT ------------------------------------- */}
      <motion.div variants={item} className="flex justify-end">
        <PeriodSelector />
      </motion.div>

      {/* KPIs --------------------------------------------------- */}
      <motion.div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4" variants={container}>
        <motion.div variants={item}>
          <KpiCard
            title="Saldo do mês"
            icon={<Wallet className="size-5" />}
            colorFrom="hsl(var(--chart-emerald))"
            colorTo="hsl(var(--chart-emerald)/.7)"
            value={kpis.saldoMes}
            spark={sparkSaldo}
            sparkColor="hsl(var(--chart-emerald))"
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            title="Entradas"
            icon={<TrendingUp className="size-5" />}
            colorFrom="hsl(var(--chart-blue))"
            colorTo="hsl(var(--chart-blue)/.7)"
            value={kpis.entradasMes}
            trend="up"
            spark={sparkIn}
            sparkColor="hsl(var(--chart-blue))"
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            title="Saídas"
            icon={<CreditCard className="size-5" />}
            colorFrom="hsl(var(--chart-rose))"
            colorTo="hsl(var(--chart-amber))"
            value={kpis.saidasMes}
            trend="down"
            spark={sparkOut}
            sparkColor="hsl(var(--chart-rose))"
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            title="Investido total"
            icon={<PiggyBank className="size-5" />}
            colorFrom="hsl(var(--chart-violet))"
            colorTo="hsl(var(--chart-blue))"
            value={kpis.investidoTotal}
            spark={sparkInv}
            sparkColor="hsl(var(--chart-violet))"
          />
        </motion.div>

      </motion.div>

      {/* WIDGETS ----------------------------------------------- */}
      <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={container}>
        <motion.div variants={item}>
          <InsightCard message={insightMessage} onClick={() => setActiveWidget('insight')} />
        </motion.div>
        <motion.div variants={item}>
          <ForecastChart data={forecastData} onClick={() => setActiveWidget('forecast')} />
        </motion.div>
        <motion.div variants={item}>
          <RecurrenceList items={recurrences} onClick={() => setActiveWidget('recurrence')} />
        </motion.div>
        <motion.div variants={item}>
          <BalanceForecast current={kpis.saldoMes} forecast={kpis.saldoMes + 1000} onClick={() => setActiveWidget('balance')} />
        </motion.div>
        <motion.div variants={item}>
          <AlertList alerts={alerts} onClick={() => setActiveWidget('alerts')} />
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
          <Card className="h-full overflow-x-auto">
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
            <WidgetFooterAction to="/financas/mensal" label="Ver Finanças" />
          </WidgetCard>
        </motion.div>

        <motion.div variants={item}>
          <WidgetCard className="h-full">
            <WidgetHeader
              title="Metas em andamento"
              subtitle="Progresso geral"
            />
            <MetasSummary />
            <WidgetFooterAction
              to="/metas"
              label="Ir para Metas & Projetos"
            />
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
            to="/investimentos"
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
            className="mt-2 rounded bg-emerald-600 px-3 py-1 text-sm text-white"
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
function HeroHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white backdrop-blur-sm border-b border-white/10 shadow-lg">
      {/* logo + título, sem descrição */}
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LogoFY size={44} />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Finanças do Yago</h1>
        </div>
        <div className="mt-1 flex gap-2 sm:mt-0">
          <Link to="/financas/mensal" className="rounded-xl bg-white/90 px-4 py-2 font-medium text-emerald-700 shadow hover:bg-white transition">
            Ver Finanças
          </Link>
          <Link to="/investimentos" className="rounded-xl bg-white/15 px-4 py-2 font-medium text-white ring-1 ring-white/30 hover:bg-white/20 transition">
            Ver Investimentos
          </Link>
        </div>
      </div>
    </div>
  );
}

// Logo “FY” estilizada em SVG
function LogoFY({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Logo Finanças do Yago"
      className="rounded-xl shadow-md"
    >
      <defs>
        <linearGradient id="fy-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="fy-txt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#fy-bg)" />
      <circle cx="50" cy="14" r="18" fill="#fff" opacity="0.15" />
      <g transform="translate(12,16)" fill="url(#fy-txt)">
        <path d="M4 0h22v6H10v6h12v6H4z" />
        <path d="M34 0l-6 9 6 9h-8l-4-6-4 6h-8l6-9-6-9h8l4 6 4-6z" />
      </g>
    </svg>
  );
}

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

function CardFooterAction({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline">
      {label} <ChevronRight className="size-4" />
    </Link>
  );
}
