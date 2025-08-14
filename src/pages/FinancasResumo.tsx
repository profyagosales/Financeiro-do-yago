import PageHeader from '@/components/PageHeader';
import ForecastChart from '@/components/dashboard/ForecastChart';
import { WidgetCard, WidgetHeader, WidgetFooterAction } from '@/components/dashboard/WidgetCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import {
  getMonthlyAggregates,
  getLast12MonthsAggregates,
  getUpcomingBills,
  getBudgetUsage,
} from '@/lib/finance';
import { transactions } from '@/data/transactions';
import type { Bill } from '@/hooks/useBills';

const billsMock: Bill[] = [
  { id: '1', description: 'Internet', amount: 129.9, due_date: '2025-08-12', paid: false, account_id: null, card_id: null, category_id: null },
  { id: '2', description: 'Luz', amount: 220.5, due_date: '2025-08-14', paid: false, account_id: null, card_id: null, category_id: null },
  { id: '3', description: 'Cartão Nubank', amount: 830, due_date: '2025-08-16', paid: false, account_id: null, card_id: null, category_id: null },
];

export default function FinancasResumo() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const monthlyAgg = getMonthlyAggregates(transactions, month, year);
  const last12 = getLast12MonthsAggregates(transactions, month, year);
  const upcoming = getUpcomingBills(billsMock, { days: 30 });

  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const budgetInfo = getBudgetUsage({
    transactions: transactions.filter((t) => t.month === monthKey),
    budget: undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Resumo de finanças" subtitle="Visão geral do mês atual" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <WidgetCard>
          <WidgetHeader title="Resumo do mês" />
          <div className="space-y-1 text-sm">
            <p className="flex justify-between"><span>Entradas</span><span className="font-medium">{formatCurrency(monthlyAgg.income)}</span></p>
            <p className="flex justify-between"><span>Saídas</span><span className="font-medium">{formatCurrency(monthlyAgg.expense)}</span></p>
            <p className="flex justify-between"><span>Saldo</span><span className="font-medium">{formatCurrency(monthlyAgg.balance)}</span></p>
          </div>
          <WidgetFooterAction to="/financas/mensal" label="Detalhar" />
        </WidgetCard>

        {budgetInfo ? (
          <WidgetCard>
            <WidgetHeader title="Orçamento do mês" />
            <p className="mb-2 text-sm font-medium">
              {formatCurrency(budgetInfo.spent)} de {formatCurrency(budgetInfo.budget)}
            </p>
            <Progress value={budgetInfo.percent} />
          </WidgetCard>
        ) : (
          <WidgetCard>
            <WidgetHeader title="Orçamento do mês" />
            <EmptyState title="Nenhum orçamento" message="Defina um orçamento para acompanhar seus gastos." />
            <WidgetFooterAction to="/financas/mensal" label="Definir orçamento" />
          </WidgetCard>
        )}

        <WidgetCard className="md:col-span-2 xl:col-span-1">
          <WidgetHeader title="Próximas contas" />
          {upcoming.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {upcoming.map((b) => (
                <li key={b.id} className="flex justify-between">
                  <span>{b.description}</span>
                  <span className="font-medium">{formatCurrency(b.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Sem contas próximas" />
          )}
          <WidgetFooterAction to="/bills" label="Ver contas" />
        </WidgetCard>

        <WidgetCard className="md:col-span-2 xl:col-span-3">
          <WidgetHeader title="Últimos 12 meses" />
          <ForecastChart data={last12} />
        </WidgetCard>
      </div>
    </div>
  );
}
