import dayjs from "dayjs";
import { CalendarRange, Coins, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Heading } from '@/components/ui/Heading';
import CategoryDonut from "@/components/charts/CategoryDonut";
import PageHeader from "@/components/PageHeader";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { MotionCard } from "@/components/ui/MotionCard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useCategories } from "@/hooks/useCategories";
import { getYearSummary, type YearSummary } from "@/hooks/useTransactions";

// Dark mode labels: garanta contraste
// TODO: usar classes utilitárias (ex: text-fg-muted) para subtítulos; labels já usam neutros

import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');

export default function FinancasAnual() {
  const [year, setYear] = useState(() => dayjs().year());
  const [summary, setSummary] = useState<YearSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yearOptions = useMemo(() => {
    const current = dayjs().year();
    const arr: number[] = [];
    for (let i = 0; i < 5; i++) arr.push(current - i);
    return arr;
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getYearSummary(year)
      .then(setSummary)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Erro ao carregar')
      )
      .finally(() => setLoading(false));
  }, [year]);

  const { byId: categoriasById } = useCategories();

  const kpis = useMemo(() => {
    if (!summary)
      return { income: 0, expense: 0, balance: 0 };
    return {
      income: Number(summary.totalIncome) || 0,
      expense: Number(summary.totalExpense) || 0,
      balance: Number(summary.totalBalance) || 0,
    };
  }, [summary]);

  const worstMonth = useMemo(() => {
    if (!summary) return null;
    const nonZero = summary.months.filter((m) => (Number(m.expense) || 0) > 0);
    if (!nonZero.length) return null;
    return nonZero.reduce((max, m) => (m.expense > max.expense ? m : max));
  }, [summary]);

  const worstLabel = useMemo(() => {
    if (!worstMonth) return '';
    const mes = dayjs(`${year}-${String(worstMonth.month).padStart(2, '0')}-01`).format('MMMM');
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  }, [worstMonth, year]);

  const curveData = useMemo(() => {
    if (!summary) return [] as { mes: string; saldo: number }[];
    return summary.months.map((m) => {
      const label = dayjs(
        `${year}-${String(m.month).padStart(2, '0')}-01`
      ).format('MMM');
      return {
        mes: label.charAt(0).toUpperCase() + label.slice(1),
        saldo: m.balance,
      };
    });
  }, [summary, year]);

  const categoriesData = useMemo(() => {
    if (!summary) return [] as { category: string; value: number }[];
    const agg: Record<string, number> = {};
    summary.months.forEach((m) => {
      Object.entries(m.byCategory).forEach(([cat, val]) => {
        agg[cat] = (agg[cat] ?? 0) + (Number(val) || 0);
      });
    });
    return Object.entries(agg).map(([catId, value]) => ({
      category:
        catId === 'null'
          ? 'Sem categoria'
          : categoriasById.get(catId)?.name ?? 'Sem categoria',
      value,
    }));
  }, [summary, categoriasById]);

  const monthsTable = useMemo(() => {
    if (!summary) return [] as YearSummary['months'];
    return summary.months;
  }, [summary]);

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Finanças — Anual"
        actions={(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <div>
              <span className="mb-1 block text-xs text-emerald-900/70 dark:text-emerald-100/80">Ano</span>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="min-w-[120px] bg-background text-foreground">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-1">
              <Button asChild>
                <Link to="/financas/mensal">Ver Mensal</Link>
              </Button>
            </div>
          </div>
        )}
      />

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-600 text-white">
              <TrendingUp size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted">Entradas</span>
              <AnimatedNumber value={kpis.income} />
            </div>
          </div>
        </MotionCard>

        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-rose-500 text-white">
              <TrendingDown size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted">Saídas</span>
              <AnimatedNumber value={kpis.expense} />
            </div>
          </div>
        </MotionCard>

        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-600 text-white">
              <Coins size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted">Saldo</span>
              <AnimatedNumber value={kpis.balance} />
            </div>
          </div>
        </MotionCard>

        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500 text-white">
              <CalendarRange size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted">Mês com maior despesa</span>
              <AnimatedNumber value={worstMonth?.expense || 0} />
              <span className="text-xs text-muted">{worstLabel || '—'}</span>
            </div>
          </div>
        </MotionCard>
      </section>

      {/* Gráficos */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-white/10 bg-white dark:bg-slate-900 p-4">
            <Heading level={3} className="text-foreground">Saldo mensal</Heading>
            <div className="h-[320px]">
              <ResponsiveContainer>
                <AreaChart data={curveData}>
                  <XAxis dataKey="mes" tick={{ fill: 'hsl(var(--neutral-300))', opacity: 0.8 }} />
                  <YAxis tick={{ fill: 'hsl(var(--neutral-300))', opacity: 0.8 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(v: number) =>
                      (Number(v) || 0).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="saldo"
                    stroke="#10b981"
                    strokeOpacity={0.8}
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <CategoryDonut categoriesData={categoriesData} />
        </div>
      </section>

      {loading && <p>Carregando…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Tabela por mês */}
      <div className="rounded-xl border border-white/10 bg-white dark:bg-slate-900 p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted">Mês</TableHead>
              <TableHead className="text-right text-muted">Entradas</TableHead>
              <TableHead className="text-right text-muted">Saídas</TableHead>
              <TableHead className="text-right text-muted">Saldo</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthsTable.map((m) => {
              const mes = dayjs(`${year}-${String(m.month).padStart(2, '0')}-01`).format('MMMM');
              const label = mes.charAt(0).toUpperCase() + mes.slice(1);
              const linkMes = `${year}-${String(m.month).padStart(2, '0')}`;
              return (
                <TableRow key={m.month}>
                  <TableCell className="text-muted">{label}</TableCell>
                  <TableCell className="text-right">
                    {(Number(m.income) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="text-right">
                    {(Number(m.expense) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="text-right">
                    {(Number(m.balance) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/financas/mensal?mes=${linkMes}`}>Ver mês</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

