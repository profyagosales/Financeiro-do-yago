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
  Landmark,
  CalendarRange,
  Target,
  Plane,
  PieChart as PieChartIcon,
} from "lucide-react";

import BrandIcon from "@/components/BrandIcon";
import FilterBar from "@/components/FilterBar";
import { usePeriod } from "@/state/periodFilter";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTransactions, getYearSummary } from "@/hooks/useTransactions";
import { useInvestments } from "@/hooks/useInvestments";
import { useGoals } from "@/hooks/useGoals";
import { useMiles } from "@/hooks/useMiles";
import { getUpcoming, type Bill } from "@/hooks/useBills";

// ---------------------------------- helpers
const brl = (n: number) =>
  (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function monthShortPtBR(n: number) {
  const arr = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return arr[Math.max(1, Math.min(12, n)) - 1];
}

// CountUp (framer-motion)
function CountUp({ value, prefix = "R$ " }: { value: number; prefix?: string }) {
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
  return (
    <span>
      {prefix}
      {Math.round(out).toLocaleString("pt-BR")}
    </span>
  );
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
  const { mode, month, year } = usePeriod();

  const { data: txs, kpis: txKpis, loading: txLoading } = useTransactions(year, month);
  const { rows: invRows, kpis: invKpis, byType: carteira, loading: invLoading } = useInvestments();
  const { data: goals, loading: goalsLoading } = useGoals();
  const { saldoTotal: milesSaldo, loading: milesLoading } = useMiles();

  const [fluxo, setFluxo] = useState<Array<{ m: string; in: number; out: number; saldo: number }>>([]);
  useEffect(() => {
    void getYearSummary(year)
      .then((s) => {
        const arr = s.months.map((m) => ({
          m: monthShortPtBR(m.month),
          in: m.income,
          out: m.expense,
          saldo: m.balance,
        }));
        setFluxo(arr);
      })
      .catch(() => setFluxo([]));
  }, [year]);

  const sparkIn = useMemo(() => txs.filter(t => t.amount > 0).slice(-8).map(t => t.amount), [txs]);
  const sparkOut = useMemo(() => txs.filter(t => t.amount < 0).slice(-8).map(t => Math.abs(t.amount)), [txs]);
  const sparkSaldo = useMemo(() => {
    const arr: number[] = [];
    let acc = 0;
    txs.slice(-8).forEach(t => { acc += t.amount; arr.push(acc); });
    return arr;
  }, [txs]);

  const sparkInv = useMemo(() => {
    let total = 0;
    return invRows.slice(-8).map(r => {
      total += r.quantity * r.price + (r.fees || 0);
      return total;
    });
  }, [invRows]);

  const cores = [
    "hsl(var(--chart-emerald))",
    "hsl(var(--chart-violet))",
    "hsl(var(--chart-blue))",
    "hsl(var(--chart-amber))",
  ];

  const [contasAVencer, setContasAVencer] = useState<Bill[]>([]);
  const [billsLoading, setBillsLoading] = useState(true);
  useEffect(() => {
    setBillsLoading(true);
    void getUpcoming(month, year)
      .then((rows) => setContasAVencer(rows))
      .finally(() => setBillsLoading(false));
  }, [month, year]);

  const metas = useMemo(() => goals.slice(0, 3).map(g => ({ t: g.title, pct: Math.round(g.progress_pct) })), [goals]);

  const aportesRecentes = useMemo(() => invRows.slice(0, 5).map(r => ({
    data: r.date,
    tipo: r.type,
    ativo: r.symbol || r.name,
    qtd: r.quantity,
    preco: r.price,
  })), [invRows]);

  const kpis = useMemo(() => ({
    saldoMes: txKpis.saldo,
    entradasMes: txKpis.entradas,
    saidasMes: txKpis.saidas,
    investidoTotal: invKpis.total,
  }), [txKpis, invKpis]);

  const loading = txLoading || invLoading || goalsLoading || milesLoading || billsLoading;

  const fluxoTitle = `Fluxo de caixa — ${mode === "monthly" ? `${monthShortPtBR(month)} ${year}` : `Ano ${year}`}`;

  const container = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

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
        <HeroHeader />
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
                      tickFormatter={(v) => brl(Number(v)).replace("R$", "")}
                      width={64}
                      tickMargin={8}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(v: unknown) => brl(Number(v))}
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
                        formatter={(v: number) => brl(v)}
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
                      <span className="ml-auto font-medium">{brl(c.value)}</span>
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
                  <li key={c.id} className="flex items-center gap-3 py-3">
                    <BrandIcon name={c.description} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.description}</div>
                      <div className="text-xs text-muted-foreground">
                        vence em {new Date(c.due_date).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <div className="ml-auto font-medium">{brl(c.amount)}</div>
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
            {metas.length === 0 ? (
              <EmptyState icon={<Target className="h-6 w-6" />} title="Sem metas" />
            ) : (
              <div className="space-y-4">
                {metas.map((g) => (
                  <div key={g.t}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-300">{g.t}</span>
                      <span className="font-medium">{g.pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-800/70">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${g.pct}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                        <td className="py-2 text-right font-medium">{brl(r.preco * (r.qtd || 1))}</td>
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

      {/* ACESSOS RÁPIDOS ---------------------------------------- */}
      <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={container}>
        <motion.div variants={item}>
          <QuickLink to="/financas/mensal" icon={<CalendarRange className="h-5 w-5" />} title="Finanças do mês" desc={`Saldo ${brl(kpis.saldoMes)}`} />
        </motion.div>
        <motion.div variants={item}>
          <QuickLink to="/investimentos" icon={<Landmark className="h-5 w-5" />} title="Resumo de investimentos" desc={brl(kpis.investidoTotal)} />
        </motion.div>
        <motion.div variants={item}>
          <QuickLink to="/metas" icon={<Target className="h-5 w-5" />} title="Metas e projetos" desc={`${goals.length} metas`} />
        </motion.div>
        <motion.div variants={item}>
          <QuickLink to="/milhas/livelo" icon={<Plane className="h-5 w-5" />} title="Milhas e pontos" desc={`${milesSaldo.toLocaleString('pt-BR')} pts`} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------- partials
function HeroHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white backdrop-blur-sm border-b border-white/10 shadow-lg">
      {/* logo + título, sem descrição */}
      <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <LogoFY size={44} />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Finanças do Yago</h1>
        </div>
        <div className="mt-1 flex gap-2 md:mt-0">
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
        className="pointer-events-none absolute -right-8 -top-8 z-0 h-28 w-28 rounded-full opacity-25 blur-2xl"
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
            ▲ bom
          </span>
        ) : trend === "down" ? (
          <span
            aria-hidden
            className="pointer-events-none mt-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700"
          >
            ▼ atenção
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

function QuickLink({ to, icon, title, desc }: { to: string; icon: ReactNode; title: string; desc: string }) {
  return (
    <Card className="group h-full border-0 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_2px_12px_-3px_rgba(16,185,129,0.3)] transition hover:scale-[1.01]">
      <div className="mb-2 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
          {icon}
        </span>
        <span className="font-semibold">{title}</span>
      </div>
      <div className="mb-4 text-sm text-white/80">{desc}</div>
      <Link
        to={to}
        className="inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30"
      >
        Abrir
      </Link>
    </Card>
  );
}