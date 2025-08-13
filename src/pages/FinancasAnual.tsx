import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { Coins, TrendingUp, TrendingDown, CalendarRange } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Link } from "react-router-dom";

import PageHeader from "@/components/PageHeader";
import { MotionCard } from "@/components/ui/MotionCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CategoryDonut from "@/components/charts/CategoryDonut";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getYearSummary, type YearSummary } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

dayjs.locale("pt-br");

export default function FinancasAnual() {
  const [year, setYear] = useState(() => dayjs().year());
  const [summary, setSummary] = useState<YearSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yearOptions = useMemo(() => {
    const current = dayjs().year();
    return Array.from({ length: 5 }, (_, i) => current - i);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getYearSummary(year)
      .then(setSummary)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Erro ao carregar"),
      )
      .finally(() => setLoading(false));
  }, [year]);

  const kpis = summary?.totals ?? { income: 0, expense: 0, balance: 0 };

  const worstLabel = useMemo(() => {
    if (!summary || !summary.worstMonth) return "";
    const mes = dayjs(
      `${year}-${String(summary.worstMonth).padStart(2, "0")}-01`,
    ).format("MMMM");
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  }, [summary, year]);

  const worstValue = useMemo(() => {
    if (!summary || !summary.worstMonth) return 0;
    return (
      summary.months.find((m) => m.month === summary.worstMonth)?.expense || 0
    );
  }, [summary]);

  const curveData = useMemo(() => {
    if (!summary) return [] as { mes: string; saldo: number }[];
    return summary.months.map((m) => {
      const label = dayjs(
        `${year}-${String(m.month).padStart(2, "0")}-01`,
      ).format("MMM");
      return {
        mes: label.charAt(0).toUpperCase() + label.slice(1),
        saldo: m.balance,
      };
    });
  }, [summary, year]);

  const monthsTable = summary?.months ?? [];

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Finanças — Anual"
        breadcrumbs={[
          { label: "Finanças", href: "/financas/mensal" },
          { label: "Anual" },
        ]}
        actions={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <div>
              <span className="mb-1 block text-xs text-emerald-100/90">
                Ano
              </span>
              <Select
                value={String(year)}
                onValueChange={(v) => setYear(Number(v))}
              >
                <SelectTrigger className="w-full rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10">
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
        }
      />

      {/* KPIs */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MotionCard>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-600 text-white">
                <TrendingUp size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-slate-500 dark:text-slate-300">
                  Entradas
                </span>
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
                <span className="text-sm text-slate-500 dark:text-slate-300">
                  Saídas
                </span>
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
                <span className="text-sm text-slate-500 dark:text-slate-300">
                  Saldo
                </span>
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
                <span className="text-sm text-slate-500 dark:text-slate-300">
                  Mês com maior despesa
                </span>
                <AnimatedNumber value={worstValue} />
                <span className="text-xs text-slate-500 dark:text-slate-300">
                  {worstLabel || "—"}
                </span>
              </div>
            </div>
          </MotionCard>
        </section>
      )}

      {/* Gráficos */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <Skeleton className="h-72 w-full" />
          ) : monthsTable.some(
              (m) => m.balance !== 0 || m.income !== 0 || m.expense !== 0,
            ) ? (
            <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
              <h3 className="font-medium mb-3">Saldo mensal</h3>
              <div className="h-[320px]">
                <ResponsiveContainer>
                  <AreaChart data={curveData}>
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip
                      formatter={(v: number) =>
                        (Number(v) || 0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="saldo"
                      stroke="#10b981"
                      fill="#10b98133"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<TrendingUp className="h-6 w-6" />}
              title="Sem dados"
            />
          )}
        </div>
        <div className="lg:col-span-1">
          {loading ? (
            <Skeleton className="h-72 w-full" />
          ) : summary && summary.byCategory.length > 0 ? (
            <CategoryDonut categoriesData={summary.byCategory} />
          ) : (
            <EmptyState
              icon={<TrendingDown className="h-6 w-6" />}
              title="Sem dados"
            />
          )}
        </div>
      </section>

      {error && <p className="text-red-600">{error}</p>}

      {/* Tabela por mês */}
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Entradas</TableHead>
                <TableHead className="text-right">Saídas</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthsTable.map((m) => {
                const mes = dayjs(
                  `${year}-${String(m.month).padStart(2, "0")}-01`,
                ).format("MMMM");
                const label = mes.charAt(0).toUpperCase() + mes.slice(1);
                const linkMes = `${year}-${String(m.month).padStart(2, "0")}`;
                return (
                  <TableRow key={m.month}>
                    <TableCell>{label}</TableCell>
                    <TableCell className="text-right">
                      {(Number(m.income) || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {(Number(m.expense) || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {(Number(m.balance) || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/financas/mensal?mes=${linkMes}`}>
                          Ver mês
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
