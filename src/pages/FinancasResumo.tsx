import { useMemo, useState } from "react";
import { Plus, Download, Coins, TrendingUp, TrendingDown, PieChart, CalendarClock } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

import PageHeader from "@/components/PageHeader";
import KPIStrip from "@/components/dashboard/KPIStrip";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import { WidgetCard, WidgetHeader, WidgetFooterAction } from "@/components/dashboard/WidgetCard";
import DailyBars from "@/components/charts/DailyBars";
import CategoryDonut from "@/components/charts/CategoryDonut";
import AlertList from "@/components/dashboard/AlertList";
import { Button } from "@/components/ui/button";
import { ModalTransacao, type BaseData } from "@/components/ModalTransacao";
import { usePeriod } from "@/state/periodFilter";
import { useTransactions } from "@/hooks/useTransactions";
import { useBills } from "@/hooks/useBills";
import { useCategories } from "@/hooks/useCategories";
import { exportTransactionsPDF } from "@/utils/pdf";
import { formatCurrency } from "@/lib/utils";
import { getMonthlyAggregates, getLast12MonthsAggregates, getUpcomingBills, getBudgetUsage } from "@/lib/finance";
import type { UITransaction } from "@/components/TransactionsTable";

export default function FinancasResumo() {
  const { month, year } = usePeriod();
  const { data: transacoes, addSmart, list } = useTransactions(year, month);
  const { data: contas } = useBills(year, month);
  const { flat: categorias } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);

  const uiTransacoes: UITransaction[] = useMemo(() => {
    return transacoes.map(t => ({
      id: t.id,
      date: t.date,
      description: t.description,
      value: Math.abs(t.amount),
      type: t.amount >= 0 ? "income" : "expense",
      category: t.category_id ? categorias.find(c => c.id === t.category_id)?.name ?? null : null,
      category_id: t.category_id ?? null,
      source_kind: t.card_id ? "card" : t.account_id ? "account" : null,
      source_id: t.card_id ?? t.account_id ?? null,
      account_id: t.account_id ?? null,
      card_id: t.card_id ?? null,
      installment_no: t.installment_no ?? null,
      installment_total: t.installment_total ?? null,
    }));
  }, [transacoes, categorias]);

  const monthlyAgg = useMemo(() => getMonthlyAggregates(transacoes), [transacoes]);
  const upcomingBills = useMemo(() => getUpcomingBills(contas).map(b => ({ nome: b.description, vencimento: b.due_date, valor: b.amount })), [contas]);
  const budgetUsage = useMemo(() => getBudgetUsage(categorias, transacoes), [categorias, transacoes]);
  const last12 = useMemo(() => getLast12MonthsAggregates(transacoes).map(m => ({ mes: m.key.slice(5), entradas: m.income, saidas: m.expense })), [transacoes]);

  const handlePDF = () => {
    exportTransactionsPDF(
      uiTransacoes.map(t => ({
        date: t.date,
        description: t.description,
        category: t.category || "",
        source_kind: t.source_kind,
        value: t.value,
        type: t.type,
      })),
      {},
      `${year}-${String(month).padStart(2, "0")}`,
    );
  };

  const handleSubmit = async (data: BaseData) => {
    await addSmart(data);
    await list();
    setModalOpen(false);
  };

  const kpiItems = [
    {
      title: "Saldo",
      icon: <Coins className="size-5" />,
      value: monthlyAgg.balance,
      colorFrom: "hsl(var(--chart-emerald))",
      colorTo: "hsl(var(--chart-emerald))",
      spark: [0, monthlyAgg.balance],
      sparkColor: "#10b981",
    },
    {
      title: "Entradas",
      icon: <TrendingUp className="size-5" />,
      value: monthlyAgg.income,
      colorFrom: "hsl(var(--chart-blue))",
      colorTo: "hsl(var(--chart-blue))",
      spark: [0, monthlyAgg.income],
      sparkColor: "#2563eb",
    },
    {
      title: "Saídas",
      icon: <TrendingDown className="size-5" />,
      value: monthlyAgg.expense,
      colorFrom: "hsl(var(--chart-rose))",
      colorTo: "hsl(var(--chart-rose))",
      spark: [0, monthlyAgg.expense],
      sparkColor: "#dc2626",
    },
    {
      title: "Orçamento",
      icon: <PieChart className="size-5" />,
      value: budgetUsage.reduce((s, b) => s + b.spent, 0),
      colorFrom: "hsl(var(--chart-amber))",
      colorTo: "hsl(var(--chart-amber))",
      spark: [0, budgetUsage.reduce((s, b) => s + b.spent, 0)],
      sparkColor: "#f59e0b",
    },
    {
      title: "Contas a vencer",
      icon: <CalendarClock className="size-5" />,
      value: upcomingBills.reduce((s, b) => s + b.valor, 0),
      colorFrom: "hsl(var(--chart-violet))",
      colorTo: "hsl(var(--chart-violet))",
      spark: [0, upcomingBills.reduce((s, b) => s + b.valor, 0)],
      sparkColor: "#8b5cf6",
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      <PageHeader title="Finanças — Resumo" subtitle="Visão consolidada das suas finanças.">
        <PeriodSelector />
      </PageHeader>

      <div className="flex gap-2">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Transação
        </Button>
        <Button variant="outline" onClick={handlePDF}>
          <Download className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <KPIStrip items={kpiItems} />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <WidgetCard className="glass-card">
          <WidgetHeader title="Fluxo de caixa mensal" />
          <DailyBars transacoes={uiTransacoes} mes={`${year}-${String(month).padStart(2, "0")}`} />
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>

        <WidgetCard className="glass-card">
          <WidgetHeader title="Entradas vs saídas (12 meses)" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last12}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="entradas" fill="#10b981" />
                <Bar dataKey="saidas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <WidgetFooterAction to="/financas/anual" label="Ver detalhes" />
        </WidgetCard>

        <WidgetCard className="glass-card">
          <WidgetHeader title="Despesas por categoria" />
          <CategoryDonut categoriesData={budgetUsage.map(b => ({ category: b.category, value: b.spent }))} />
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>

        <WidgetCard className="glass-card">
          <WidgetHeader title="Contas a vencer" />
          <AlertList items={upcomingBills} />
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>

        <WidgetCard className="glass-card">
          <WidgetHeader title="Lançamentos recentes" />
          <ul className="divide-y divide-zinc-100/60 dark:divide-zinc-800/60">
            {uiTransacoes.slice(0, 5).map(t => (
              <li key={t.id} className="flex justify-between py-2 text-sm">
                <span className="truncate pr-2">{t.description}</span>
                <span className={t.type === "income" ? "text-emerald-600" : "text-rose-600"}>
                  {formatCurrency(t.value * (t.type === "income" ? 1 : -1))}
                </span>
              </li>
            ))}
          </ul>
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>

        <WidgetCard className="glass-card">
          <WidgetHeader title="Orçamento do mês" />
          <ul className="space-y-2">
            {budgetUsage.slice(0, 5).map(b => (
              <li key={b.category} className="flex justify-between text-sm">
                <span>{b.category}</span>
                <span>{formatCurrency(b.spent)}</span>
              </li>
            ))}
          </ul>
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>

        <WidgetCard className="glass-card">
          <WidgetHeader title="Alertas" />
          <AlertList items={upcomingBills} />
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>
      </div>

      <ModalTransacao open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
}

