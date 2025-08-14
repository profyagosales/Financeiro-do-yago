import { useEffect, useState } from "react";
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
} from "lucide-react";

import FilterBar from "@/components/FilterBar";
import BrandIcon from "@/components/BrandIcon";
import MetasSummary from "@/components/MetasSummary";
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

export default function Dashboard() {
  const {
    kpis,
    fluxo,
    sparkIn,
    sparkOut,
    sparkSaldo,
    sparkInv,
    carteira,
    cores,
    contasAVencer,
    aportesRecentes,
  } = useOverviewData();

  const { mode, month, year } = usePeriod();
  const fluxoTitle = `Fluxo de caixa — ${
    mode === "monthly" ? `${monthShortPtBR(month)} ${year}` : `Ano ${year}`
  }`;

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
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <HeroSection />
      </motion.div>

      <motion.div variants={item} className="flex justify-center">
        <div className="w-full max-w-xl">
          <FilterBar />
        </div>
      </motion.div>

      <motion.div variants={item}>
        <KPIStrip items={kpiItems} />
      </motion.div>

      <motion.div className="grid items-stretch gap-6 xl:grid-cols-3" variants={container}>
        <motion.div variants={item} className="xl:col-span-2">
          <WidgetCard className="h-full">
            <WidgetHeader
              title={fluxoTitle}
              subtitle="Entradas, saídas e saldo acumulado"
            />
            <ForecastChart data={fluxo} />
          </WidgetCard>
        </motion.div>

        <motion.div variants={item}>
          <WidgetCard className="h-full">
            <WidgetHeader
              title="Distribuição da carteira"
              subtitle="Por classe de ativos"
            />
            {carteira.length === 0 ? (
              <EmptyState
                icon={<PieChartIcon className="h-8 w-8" />}
                title="Sem dados"
              />
            ) : (
              <>
                <div className="h-[220px]">
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
              <table className="w-full text-sm">
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

      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={container}
      >
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
  );
}
