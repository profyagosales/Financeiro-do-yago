import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

import PageHeader from '@/components/PageHeader';
import { MotionCard } from '@/components/ui/MotionCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryDonut } from '@/components/charts/CategoryDonut';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import {
  getYearSummary,
  type YearSummary,
  type Transaction,
} from '@/hooks/useTransactions';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

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
    if (!summary) return { income: 0, expense: 0, balance: 0 };
    return summary.totals;
  }, [summary]);

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

  type DonutTx = Pick<Transaction, 'id' | 'date' | 'description'> & {
    value: number;
    type: 'expense';
    category: string;
  };
  const donutTx = useMemo<DonutTx[]>(() => {
    if (!summary) return [];
    return summary.byCategory
      .filter((v) => v.total > 0)
      .map((v, idx) => ({
        id: idx,
        date: '',
        description: '',
        value: v.total,
        type: 'expense',
        category:
          v.category_id === null
            ? 'Sem categoria'
            : categoriasById.get(v.category_id)?.name ?? 'Sem categoria',
      }));
  }, [summary, categoriasById]);

  type MonthRow = {
    month: number;
    income: number;
    expense: number;
    balance: number;
  };
  const monthsTable = useMemo<MonthRow[]>(() => {
    if (!summary) return [];
    return summary.months;
  }, [summary]);

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Finanças — Anual"
        actions={(
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <div>
              <span className="mb-1 block text-xs text-emerald-100/90">Ano</span>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
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
          </div>
        )}
      />

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-3">
        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-600 text-white">
              <TrendingUp size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-300">Entradas</span>
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
              <span className="text-sm text-slate-500 dark:text-slate-300">Saídas</span>
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
              <span className="text-sm text-slate-500 dark:text-slate-300">Saldo</span>
              <AnimatedNumber value={kpis.balance} />
            </div>
          </div>
        </MotionCard>
      </section>

      {/* Gráficos */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
            <h3 className="font-medium mb-3">Saldo mensal</h3>
            <div className="h-[320px]">
              <ResponsiveContainer>
                <AreaChart data={curveData}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `R$ ${Number(v).toFixed(2)}`} />
                  <Area type="monotone" dataKey="saldo" stroke="#10b981" fill="#10b98133" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <CategoryDonut transacoes={donutTx} />
        </div>
      </section>

      {loading && <p>Carregando…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Tabela por mês */}
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
              const mes = dayjs(`${year}-${String(m.month).padStart(2, '0')}-01`).format('MMMM');
              const label = mes.charAt(0).toUpperCase() + mes.slice(1);
              const linkMes = `${year}-${String(m.month).padStart(2, '0')}`;
              return (
                <TableRow key={m.month}>
                  <TableCell>{label}</TableCell>
                  <TableCell className="text-right">
                    {m.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="text-right">
                    {m.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="text-right">
                    {m.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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

