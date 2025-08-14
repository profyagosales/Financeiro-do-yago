import { useMemo, useState } from "react";
import { Plus, Download, Coins, TrendingUp, TrendingDown, PieChart, CalendarClock, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";

import PageHeader from "@/components/PageHeader";
import PeriodSelector from "@/components/dashboard/PeriodSelector";
import { WidgetCard, WidgetHeader, WidgetFooterAction } from "@/components/dashboard/WidgetCard";
import DailyBars from "@/components/charts/DailyBars";
import CategoryDonut from "@/components/charts/CategoryDonut";
import AlertList from "@/components/dashboard/AlertList";
import RecurrenceList from "@/components/dashboard/RecurrenceList";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonLine } from "@/components/ui/SkeletonLine";
import { ModalTransacao, type BaseData } from "@/components/ModalTransacao";
import { usePeriod } from "@/state/periodFilter";
import { useTransactions } from "@/hooks/useTransactions";
import { useBills } from "@/hooks/useBills";
import { useCategories } from "@/hooks/useCategories";
import InsightBar from "@/components/financas/InsightBar";
import { useInsights } from "@/hooks/useInsights";
import { exportTransactionsPDF } from "@/utils/pdf";
import { formatCurrency } from "@/lib/utils";
import { getMonthlyAggregates, getLast12MonthsAggregates, getUpcomingBills, getBudgetUsage } from "@/lib/finance";
import type { UITransaction } from "@/components/TransactionsTable";
import { KpiCard } from "@/components/financas";

export default function FinancasResumo() {
  const { month, year } = usePeriod();
  const { data: transacoes, addSmart, list, loading: transLoading } = useTransactions(year, month);
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
  const insights = useInsights(
    { year, month },
    { transactions: transacoes, categories: categorias, bills: contas, goals: [], miles: [] }
  );

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

  const kpiItems: KpiItem[] = [
    {
      title: "Saldo",
      icon: <Coins className="size-5" />,
      value: monthlyAgg.balance,
    },
    {
      title: "Entradas",
      icon: <TrendingUp className="size-5" />,
      value: monthlyAgg.income,
    },
    {
      title: "Saídas",
      icon: <TrendingDown className="size-5" />,
      value: monthlyAgg.expense,
    },
    {
      title: "Orçamento",
      icon: <PieChart className="size-5" />,
      value: budgetUsage.reduce((s, b) => s + b.spent, 0),
    },
    {
      title: "Contas a vencer",
      icon: <CalendarClock className="size-5" />,
      value: upcomingBills.reduce((s, b) => s + b.valor, 0),
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

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiItems.map((k) => (
          <KpiCard key={k.title} {...k} />
        ))}
      </div>

      {insights.length > 0 && <InsightBar insights={insights} />}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <WidgetCard className="glass-card">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-lg font-semibold">Previsão — 30 dias</h3>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-zinc-400" />
                </TooltipTrigger>
                <TooltipContent>Estimativa simples baseada na média dos últimos dias</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {transacoes.length > 0 ? (
            <>
              <ForecastMiniChart data={forecastData} isLoading={transLoading} />
              <p className="mt-2 text-sm text-zinc-500">
                Saldo no fim do mês: {formatCurrency(forecastBalance)}
              </p>
            </>
          ) : (
            <EmptyState title="Sem dados" />
          )}
        </WidgetCard>
        <WidgetCard className="glass-card">
          <WidgetHeader title="Fluxo de caixa mensal" />
          {loadingTrans ? (
            <DailyBars isLoading />
          ) : uiTransacoes.length > 0 ? (
            <DailyBars transacoes={uiTransacoes} mes={`${year}-${String(month).padStart(2, "0")}`} />
          ) : (
            <EmptyState
              title="Sem transações"
              message="Adicione uma transação para ver o fluxo de caixa."
              action={<Button size="sm" onClick={() => setModalOpen(true)}>Nova transação</Button>}
            />
          )}
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>

        <WidgetCard className="glass bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-950/60 dark:to-slate-950/30">
          <WidgetHeader title="Entradas vs saídas (12 meses)" />
          {loadingTrans ? (
            <SkeletonLine className="h-56 w-full" />
          ) : uiTransacoes.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last12}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="entradas" fill="#10b981" />
                  <Bar dataKey="saidas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="Sem dados"
              message="Adicione transações para visualizar."
              action={<Button size="sm" onClick={() => setModalOpen(true)}>Nova transação</Button>}
            />
          )}
          <WidgetFooterAction to="/financas/anual" label="Ver detalhes" />
        </WidgetCard>

        <WidgetCard className="glass bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-950/60 dark:to-slate-950/30">
          <WidgetHeader title="Despesas por categoria" />
          {loadingTrans ? (
            <CategoryDonut isLoading />
          ) : budgetUsage.length > 0 ? (
            <CategoryDonut categoriesData={budgetUsage.map(b => ({ category: b.category, value: b.spent }))} />
          ) : (
            <EmptyState
              title="Sem dados"
              message="Adicione transações para ver categorias."
              action={<Button size="sm" onClick={() => setModalOpen(true)}>Nova transação</Button>}
            />
          )}
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>

        <WidgetCard className="glass bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-950/60 dark:to-slate-950/30">
          <WidgetHeader title="Contas a vencer" />
          {upcomingBills.length > 0 ? (
            <AlertList items={upcomingBills} />
          ) : (
            <EmptyState
              title="Nenhuma conta a vencer"
              action={<Button size="sm" onClick={() => setModalOpen(true)}>Nova transação</Button>}
            />
          )}
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>

        <RecurrenceList
          className="glass-card"
          items={recurrences.map((r) => ({ name: r.description, amount: r.amount }))}
        />

        <WidgetCard className="glass-card">
          <WidgetHeader title="Lançamentos recentes" />
          {uiTransacoes.length > 0 ? (
            <ul className="divide-y divide-zinc-100/60 dark:divide-zinc-700/60">
              {uiTransacoes.slice(0, 5).map(t => (
                <li key={t.id} className="flex justify-between py-2 text-sm">
                  <span className="truncate pr-2">{t.description}</span>
                  <span className={t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                    {formatCurrency(t.value * (t.type === "income" ? 1 : -1))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Nenhuma transação"
              action={<Button size="sm" onClick={() => setModalOpen(true)}>Nova transação</Button>}
            />
          )}
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>

        <WidgetCard className="glass bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-950/60 dark:to-slate-950/30">
          <WidgetHeader title="Orçamento do mês" />
          {budgetUsage.length > 0 ? (
            <ul className="space-y-2">
              {budgetUsage.slice(0, 5).map(b => (
                <li key={b.category} className="flex justify-between text-sm">
                  <span>{b.category}</span>
                  <span>{formatCurrency(b.spent)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Sem orçamento"
              action={<Button size="sm" onClick={() => setModalOpen(true)}>Nova transação</Button>}
            />
          )}
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>


        <WidgetCard className="glass bg-gradient-to-br from-white/60 to-white/30 dark:from-slate-950/60 dark:to-slate-950/30">
          <WidgetHeader title="Alertas" />
          {upcomingBills.length > 0 ? (
            <AlertList items={upcomingBills} />
          ) : (
            <EmptyState
              title="Nenhum alerta"
              action={<Button size="sm" onClick={() => setModalOpen(true)}>Nova transação</Button>}
            />
          )}
          <WidgetFooterAction to="/financas/mensal" label="Ver detalhes" />
        </WidgetCard>
      </div>

      <ModalTransacao open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
}
