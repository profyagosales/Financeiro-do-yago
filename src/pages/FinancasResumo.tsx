/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  Download,
  ListTodo,
  Receipt,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

import PageHeader from "@/components/PageHeader";
import TransactionsTable, { type UITransaction } from "@/components/TransactionsTable";
import CategoryDonut from "@/components/charts/CategoryDonut";
import DailyBars from "@/components/charts/DailyBars";
import { WidgetCard, WidgetFooterAction, WidgetHeader } from "@/components/dashboard/WidgetCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonLine } from "@/components/ui/SkeletonLine";
import { Button } from "@/components/ui/button";
import { useBills } from "@/hooks/useBills";
import { useCategories } from "@/hooks/useCategories";
import { usePeriod } from "@/hooks/usePeriod";
import { useRecurrences } from "@/hooks/useRecurrences";
import { useTransactions } from "@/hooks/useTransactions";
import { exportTransactionsPDF } from "@/utils/pdf";

// Stubs e tipos temporários para evitar erros durante desenvolvimento
type SourceValue = any;
const SourcePicker = (_props: any) => null;
const CategoryPicker = (_props: any) => null;
const InsightBar = (_props: { insights: any[] }) => null;
const TooltipProvider = ({ children }: any) => <>{children}</>;
const Tooltip = ({ children }: any) => <>{children}</>;
const TooltipTrigger = ({ children }: any) => <>{children}</>;
const TooltipContent = ({ children }: any) => <>{children}</>;
const Info = (props: any) => <span {...props} />;
const ForecastMiniChart = (_props: any) => null;
const formatCurrency = (v: any) => String(v ?? '');
// Stubs adicionais para componentes usados na página
const RecurrenceList = (_props: any) => null;
const AlertList = (_props: any) => null;
const Badge = ({ children }: any) => <span>{children}</span>;
const ResponsiveContainer = ({ children }: any) => <div>{children}</div>;
const BarChart = ({ children }: any) => <div>{children}</div>;
const XAxis = (props: any) => <span {...props} />;
const YAxis = () => null;
const RechartsTooltip = (_props: any) => null;
const Legend = () => null;
const Bar = (_props: any) => null;
// Variáveis derivadas do globalThis se os nomes não estiverem declarados no componente
const transacoes = (globalThis as any).transactions ?? [];
const insights = (globalThis as any).insights ?? [];
// legacy global rows removed; use hooks instead

export default function FinancasResumo() {
  const { month, year } = usePeriod();
  const { data: rawTransactions, loading: transLoading } = useTransactions(year, month);
  // compatibilidade: alias usado em templates antigos
  const loadingTrans = transLoading;
  const { data: bills } = useBills(year, month);
  const { flat: categorias } = useCategories();
  const { data: recurrences } = useRecurrences();

  // estado local usado por alguns botões/modals
  const [, setModalOpen] = useState(false);

  // variáveis auxiliares simples para evitar ReferenceError em tempo de desenvolvimento
  let uiTransacoes: UITransaction[] = [];
  const last12: any[] = [];
  const budgetUsage: any[] = [];
  const forecastData: any[] = [];
  const forecastBalance = 0;

  const [source, setSource] = useState<SourceValue>({ kind: "account", id: "all" });
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const transactions: UITransaction[] = useMemo(
    () =>
      rawTransactions.map((t) => ({
        id: t.id,
        date: t.date,
        description: t.description,
        value: Math.abs(t.amount),
        type: t.amount >= 0 ? "income" : "expense",
        category_id: t.category_id ?? null,
        category: t.category_id
          ? categorias.find((c) => c.id === t.category_id)?.name ?? null
          : null,
        account_id: t.account_id ?? null,
        card_id: t.card_id ?? null,
        source_kind: t.card_id ? "card" : t.account_id ? "account" : null,
        source_id: t.card_id ?? t.account_id ?? null,
      })),
    [rawTransactions, categorias]
  );

  // após calcular transactions, popular uiTransacoes
  uiTransacoes = transactions;

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const sourceOk =
        source.id === "all"
          ? true
          : source.kind === "account"
          ? t.account_id === source.id
          : t.card_id === source.id;
      const catOk = categoryId ? t.category_id === categoryId : true;
      return sourceOk && catOk;
    });
  }, [transactions, source, categoryId]);

  const income = useMemo(
    () => filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.value, 0),
    [filtered]
  );
  const expense = useMemo(
    () => filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.value, 0),
    [filtered]
  );
  const balance = income - expense;
  const expenseCount = filtered.filter((t) => t.type === "expense").length;
  const ticket = expenseCount ? expense / expenseCount : 0;
  const totalTrans = filtered.length;

  const today = new Date().toISOString().slice(0, 10);
  const futureIncome = filtered
    .filter((t) => t.type === "income" && t.date > today)
    .reduce((s, t) => s + t.value, 0);
  const recurrenceIncome = recurrences
    .filter(
      (r) =>
        r.amount > 0 &&
        r.nextDate.startsWith(`${year}-${String(month).padStart(2, "0")}`) &&
        r.nextDate > today
    )
    .reduce((s, r) => s + r.amount, 0);
  const toReceive = futureIncome + recurrenceIncome;

  // valor padrão para evitar erro quando não há cálculo implementado ainda
  const wishlistImpact = 0;
  
  // categoriesData and monthStr not implemented yet - omitted to avoid unused vars
  const recentTransactions = useMemo(
    () => filtered.slice(-8).reverse(),
    [filtered]
  );

  const upcomingBills = useMemo(() => {
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + 14);
    return bills.filter((b) => {
      const d = new Date(b.due_date);
      return !b.paid && d >= now && d <= limit;
    });
  }, [bills]);

  const kpis = [
    { title: "Saldo", icon: <Wallet className="size-5" />, value: balance, fmt: formatCurrency },
    { title: "Entradas", icon: <ArrowUpCircle className="size-5" />, value: income, fmt: formatCurrency },
    { title: "Saídas", icon: <ArrowDownCircle className="size-5" />, value: expense, fmt: formatCurrency },
    { title: "Ticket médio", icon: <Receipt className="size-5" />, value: ticket, fmt: formatCurrency },
    { title: "Transações do mês", icon: <ListTodo className="size-5" />, value: totalTrans, fmt: (n: number) => String(n) },
    { title: "A receber", icon: <CalendarClock className="mr-2 size-5" />, value: toReceive, fmt: formatCurrency },
  ];

  const handleExport = () => {
    try {
      const g = (globalThis as any);
      const data = g.rows ?? g.transactions ?? g.items ?? [];
      const filtros = g.filtros ?? {};
      const period = g.period ?? '';
      exportTransactionsPDF(data, filtros, period);
    } catch (err) {
       
      console.error('Erro ao exportar PDF:', err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finanças — Resumo"
        breadcrumbs={[
          { label: "Finanças", href: "/financas" },
          { label: "Resumo" },
        ]}
        actions={
          <Button onClick={handleExport} variant="secondary">
            <Download className="mr-2 size-4" /> Exportar PDF
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SourcePicker
          value={source}
          onChange={setSource}
          placeholder={undefined}
          className="w-full sm:w-52"
        />
        <CategoryPicker
          value={categoryId}
          onChange={setCategoryId}
          placeholder={undefined}
          className="w-full sm:w-52"
          allowClear
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {kpis.map((k) => (
          <div
            key={k.title}
            className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-2 rounded-2xl shadow/soft bg-background/60 backdrop-blur border border-white/10 dark:border-white/5 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/90 p-2 text-primary-foreground">
                {k.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{k.title}</span>
                {transLoading ? (
                  <SkeletonLine className="mt-1 h-6 w-24" />
                ) : (
                  <span className="text-xl font-semibold">
                    {k.fmt(k.value)}
                  </span>
                )}
              </div>
            </div>
          </div>
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
          <WidgetFooterAction to="/financas/mensal">Ver detalhes</WidgetFooterAction>
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
          <WidgetFooterAction to="/financas/anual">Ver detalhes</WidgetFooterAction>
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
          <WidgetFooterAction to="/financas/mensal">Ver detalhes</WidgetFooterAction>
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
          <WidgetFooterAction to="/financas/mensal">Ver detalhes</WidgetFooterAction>
        </WidgetCard>

        <WidgetCard className="glass-card">
          <WidgetHeader title="Impacto de desejos comprados" />
          {wishlistImpact > 0 ? (
            <p className="px-4 py-6 text-3xl font-semibold">
              {formatCurrency(wishlistImpact)}
            </p>
          ) : (
            <EmptyState title="Sem desejos comprados" />
          )}
        </WidgetCard>

        <RecurrenceList
          className="glass-card"
          items={recurrences.map((r) => ({ name: r.description, amount: r.amount }))}
        />

        <WidgetCard className="glass-card">
          <WidgetHeader title="Lançamentos recentes" />
          {uiTransacoes.length > 0 ? (
            <div className="overflow-x-auto">
              <ul className="flex gap-4">
                {uiTransacoes.slice(0, 5).map(t => (
                  <li
                    key={t.id}
                    className="min-w-[14rem] rounded-md border p-3 text-sm"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="truncate">{t.description}</span>
                      {t.origin?.wishlist_item_id && (
                        <Badge variant="outline">Origem: Desejo</Badge>
                      )}
                    </div>
                    <span
                      className={
                        t.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }
                    >
                      {formatCurrency(t.value * (t.type === "income" ? 1 : -1))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState title="Nenhuma conta" />
          )}
        </WidgetCard>
        <div className="col-span-12 rounded-2xl shadow/soft bg-background/60 backdrop-blur border border-white/10 dark:border-white/5 p-4">
          <h3 className="mb-3 font-medium">Transações recentes</h3>
          {transLoading ? (
            <SkeletonLine className="h-40" />
          ) : recentTransactions.length ? (
            <TransactionsTable
              transacoes={recentTransactions}
              onEdit={() => {}}
              onDelete={async () => {}}
            />
          ) : (
            <EmptyState title="Sem transações" />
          )}
        </div>
      </div>
    </div>
  );
}
