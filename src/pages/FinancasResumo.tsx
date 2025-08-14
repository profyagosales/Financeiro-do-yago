import { Download } from 'lucide-react';
import { toast } from 'sonner';

import Dashboard from './Dashboard';

import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import PeriodSelector from '@/components/dashboard/PeriodSelector';
import { useTransactions } from '@/hooks/useTransactions';
import { usePeriod } from '@/state/periodFilter';
import { exportTransactionsPDF } from '@/utils/pdf';

function periodLabel(mode: string, month: number, year: number) {
  if (mode === 'monthly') {
    return `${String(month).padStart(2, '0')}/${year}`;
  }
  if (mode === 'yearly') {
    return `${year}`;
  }
  return `${String(month).padStart(2, '0')}/${year}`;
}

export default function FinancasResumo() {
  const { mode, month, year } = usePeriod();
  const { data } = useTransactions(year, month);

  const handleExport = () => {
    if (!data.length) {
      toast.info('Nada para exportar');
      return;
    }
    const rows = data.map((t) => ({
      date: t.date,
      description: t.description,
      category: t.category_id ?? null,
      source_kind: t.account_id ? 'account' : t.card_id ? 'card' : null,
      value: Math.abs(t.amount),
      type: t.amount >= 0 ? 'income' : 'expense',
    }));
    const period = periodLabel(mode, month, year);
    exportTransactionsPDF(rows, {}, period);
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Finanças — Resumo"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PeriodSelector />
            <Button
              variant="outline"
              onClick={handleExport}
              className="inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Exportar PDF
            </Button>
          </div>
        }
      />

      <Dashboard />
    </div>
  );
}
