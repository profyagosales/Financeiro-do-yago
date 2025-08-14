import { useEffect, useMemo, useState, type ReactNode, type PropsWithChildren } from 'react';
import { Link } from "react-router-dom";
import { motion, useMotionValue, animate } from "framer-motion";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  CreditCard,
  ChevronRight,
  PieChart as PieChartIcon,
} from "lucide-react";

import BrandIcon from "@/components/BrandIcon";
import FilterBar from "@/components/FilterBar";
import HeroSection from "@/components/dashboard/HeroSection";
import { usePeriod } from "@/state/periodFilter";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import MetasSummary from "@/components/MetasSummary";

// Garantir decorativos não interativos
// className nos decorativos: "pointer-events-none select-none -z-10 opacity-25"
// conteúdo dos cards: "relative z-10"

function monthShortPtBR(n: number) {
  const arr = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return arr[Math.max(1, Math.min(12, n)) - 1];
}

// CountUp (framer-motion)
function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const [out, setOut] = useState(0);
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 1.1, ease: "easeOut" });
    const unsub = mv.on("change", (v) => setOut(v));
    return () => {
      ctrl.stop();
      unsub();
    };
  }, [value, mv]);
  return <span>{formatCurrency(Math.round(out))}</span>;
}

// Sparkline inline SVG
function Sparkline({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const w = 88, h = 28, pad = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
    const y = h - (norm(v) * (h - pad * 2) + pad);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const path = `M ${pts.join(" L ")}`;
  const last = pts[pts.length - 1]?.split(",") || ["0", "0"];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`} fill="url(#sparkFill)" />
      <path d={path} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
      <circle cx={Number(last[0])} cy={Number(last[1])} r={2.2} fill={color} />
    </svg>
  );
}

// ---------------------------------- page
export default function Dashboard() {
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

  const { mode, month, year } = usePeriod();
    const fluxoTitle = `Fluxo de caixa — ${mode === "monthly" ? `${monthShortPtBR(month)} ${year}` : `Ano ${year}`}`;

  const container = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } } };
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

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* HERO --------------------------------------------------- */}
      <motion.div variants={item}>
        <HeroSection title="Finanças do Yago" />
      </motion.div>

      {/* FILTRO CENTRALIZADO ------------------------------------ */}
      <motion.div variants={item} className="flex justify-center">
        <div className="w-full max-w-xl">
          <FilterBar />
        </div>
      </motion.div>

      {/* KPIs --------------------------------------------------- */}
      <motion.div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4" variants={container}>
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

      {/* GRÁFICOS ---------------------------------------------- */}
      <motion.div className="grid items-stretch gap-6 xl:grid-cols-3" variants={container}>
        <motion.div variants={item} className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader title={fluxoTitle} subtitle="Entradas, saídas e saldo acumulado" />
            <div className="h-[220px]">
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
          <Card className="h-full">
            <CardHeader title="Distribuição da carteira" subtitle="Por classe de ativos" />
            {carteira.length === 0 ? (
              <EmptyState icon={<PieChartIcon className="h-8 w-8" />} title="Sem dados" />
            ) : (
              <>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {cores.map((c, i) => (
                          <linearGradient id={`g${i}`} x1="0" x2="1" y1="0" y2="1" key={i}>
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
                        contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}
                        wrapperStyle={{ outline: 'none' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {carteira.map((c, i) => (
                    <li key={c.name} className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: cores[i] }} />
                      <span className="text-muted-foreground">{c.name}</span>
                      <span className="ml-auto font-medium">{formatCurrency(c.value)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* LISTAS ------------------------------------------------- */}
      <motion.div className="grid items-stretch gap-6 xl:grid-cols-3" variants={container}>
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader title="Próximas contas a vencer" subtitle="Próximos 10 dias" />
            {contasAVencer.length === 0 ? (
              <EmptyState icon={<CreditCard className="h-6 w-6" />} title="Nenhuma conta a vencer" />
            ) : (
              <ul className="divide-y divide-zinc-100/60 dark:divide-zinc-800/60">
                {contasAVencer.map((c) => (
                  <li key={c.nome + c.vencimento} className="flex items-center gap-3 py-3">
                    <BrandIcon name={c.nome} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        vence em {new Date(c.vencimento).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div className="ml-auto font-medium">{formatCurrency(c.valor)}</div>
                  </li>
                ))}
              </ul>
            )}
            <CardFooterAction to="/financas/mensal" label="Ver Finanças" />
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader title="Metas em andamento" subtitle="Progresso geral" />
            <MetasSummary />
            <CardFooterAction to="/metas" label="Ir para Metas & Projetos" />
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader title="Aportes recentes" subtitle="Últimas 5 operações" />
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
                        <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="Sem aportes" />
                      </td>
                    </tr>
                  ) : (
                    aportesRecentes.map((r) => (
                      <tr key={r.data + r.ativo}>
                        <td className="py-2">
                          <BrandIcon name={`${r.ativo} ${r.tipo}`} />
                        </td>
                        <td className="py-2">{new Date(r.data).toLocaleDateString("pt-BR")}</td>
                        <td className="py-2">{r.ativo}</td>
                        <td className="py-2">{r.tipo}</td>
                        <td className="py-2 text-right font-medium">{formatCurrency(r.preco * (r.qtd || 1))}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <CardFooterAction to="/investimentos" label="Abrir Investimentos" />
          </Card>
        </motion.div>
      </motion.div>

    </motion.div>
  );
}

function KpiCard({
  title,
  icon,
  value,
  trend,
  colorFrom,
  colorTo,
  spark,
  sparkColor,
}: {
  title: string;
  icon: ReactNode;
  value: number;
  trend?: "up" | "down";
  colorFrom: string;
  colorTo: string;
  spark: number[];
  sparkColor: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="kpi relative h-[136px]"
    >
      {/* Ícone decorativo sem capturar cliques */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 -z-10 h-28 w-28 rounded-full opacity-25 blur-2xl"
        style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
      />
      <div className="relative z-10 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="kpi-icon"
              style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
            >
              {icon}
            </div>
            <div>
              <p className="kpi-title">{title}</p>
              <p className="kpi-value">
                <CountUp value={value} />
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Sparkline data={spark} color={sparkColor} />
          </div>
        </div>
        {trend === "up" ? (
          <span
            aria-hidden
            className="pointer-events-none mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
          >
            <span aria-hidden className="pointer-events-none opacity-25">
              ▲
            </span>
            bom
          </span>
        ) : trend === "down" ? (
          <span
            aria-hidden
            className="pointer-events-none mt-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700"
          >
            <span aria-hidden className="pointer-events-none opacity-25">
              ▼
            </span>
            atenção
          </span>
        ) : null}
      </div>
    </motion.div>
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