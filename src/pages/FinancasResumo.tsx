import { useMemo, useState } from "react";
import {
  Download,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Receipt,
  ListTodo,
  CalendarClock,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import SourcePicker, { type SourceValue } from "@/components/SourcePicker";
import CategoryPicker from "@/components/CategoryPicker";
import DailyBars from "@/components/charts/DailyBars";
import CategoryDonut from "@/components/charts/CategoryDonut";
import TransactionsTable, { type UITransaction } from "@/components/TransactionsTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonLine } from "@/components/ui/SkeletonLine";
import { Button } from "@/components/ui/button";
import { usePeriod } from "@/hooks/usePeriod";
import { useTransactions } from "@/hooks/useTransactions";
import { useBills } from "@/hooks/useBills";
import { useCategories } from "@/hooks/useCategories";
import { useRecurrences } from "@/hooks/useRecurrences";
import { exportTransactionsPDF } from "@/utils/pdf";
import { formatCurrency } from "@/lib/utils";

export default function FinancasResumo() {
  const { month, year } = usePeriod();
  const { data: rawTransactions, loading: transLoading } = useTransactions(year, month);
  const { data: bills, loading: billsLoading } = useBills(year, month);
  const { flat: categorias } = useCategories();
  const { data: recurrences } = useRecurrences();

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

  const categoriesData = useMemo(() => {
    const byCat = filtered
      .filter((t) => t.type === "expense")
      .reduce<Record<string, number>>((acc, t) => {
        const key = t.category || "Sem categoria";
        acc[key] = (acc[key] ?? 0) + t.value;
        return acc;
      }, {});
    const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 5);
    const rest = sorted.slice(5).reduce((s, [, v]) => s + v, 0);
    if (rest > 0) top.push(["Outras", rest]);
    return top.map(([category, value]) => ({ category, value }));
  }, [filtered]);

  const monthStr = String(month).padStart(2, "0");
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
    { title: "A receber", icon: <CalendarClock className="size-5" />, value: toReceive, fmt: formatCurrency },
  ];

  const handleExport = () => {
    const rows = filtered.map((t) => ({
      date: t.date,
      description: t.description,
      category: t.category,
      source_kind: t.source_kind,
      value: t.value,
      type: t.type,
    }));
    exportTransactionsPDF(rows, {}, `${year}-${monthStr}`);
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

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6 rounded-2xl shadow/soft bg-background/60 backdrop-blur border border-white/10 dark:border-white/5 p-4">
          <DailyBars
            transacoes={filtered}
            mes={`${year}-${monthStr}`}
            isLoading={transLoading}
          />
        </div>
        <div className="col-span-12 lg:col-span-6 rounded-2xl shadow/soft bg-background/60 backdrop-blur border border-white/10 dark:border-white/5 p-4">
          <CategoryDonut categoriesData={categoriesData} isLoading={transLoading} />
        </div>
        <div className="col-span-12 lg:col-span-6 rounded-2xl shadow/soft bg-background/60 backdrop-blur border border-white/10 dark:border-white/5 p-4">
          <h3 className="mb-3 font-medium">Próximos vencimentos</h3>
          {billsLoading ? (
            <SkeletonLine className="h-24" />
          ) : upcomingBills.length ? (
            <ul className="divide-y divide-white/10 text-sm dark:divide-white/5">
              {upcomingBills.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-2">
                  <span className="truncate pr-2">{b.description}</span>
                  <span>{new Date(b.due_date).toLocaleDateString("pt-BR")}</span>
                  <span className="font-medium">{formatCurrency(b.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Nenhuma conta" />
          )}
        </div>
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
