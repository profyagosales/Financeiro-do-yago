import { useEffect, useState } from 'react';

import { usePeriod } from '@/state/periodFilter';

export type Insight = { message: string };

export function useInsights() {
  const { mode, month, year } = usePeriod();
  const [data, setData] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Placeholder: in real app fetch insights based on period
    setTimeout(() => {
      setData([{ message: 'Você economizou 15% a mais este mês.' }]);
      setIsLoading(false);
    }, 300);
  }, [mode, month, year]);

  return { data, isLoading };
}
