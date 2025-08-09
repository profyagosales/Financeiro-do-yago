import { useEffect } from 'react';
import FilterBar from '@/components/FilterBar';
import { usePeriod } from '@/state/periodFilter';

export default function FinancasAnual() {
  const { setMode } = usePeriod();
  useEffect(() => { setMode('yearly'); }, [setMode]);

  return (
    <div className="space-y-6">
      <FilterBar />
      <h1 className="text-2xl font-bold">💰 Finanças - Anual</h1>
    </div>
  );
}
