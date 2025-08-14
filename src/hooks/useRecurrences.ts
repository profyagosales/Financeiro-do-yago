import { useEffect, useState } from 'react';

import { usePeriod } from '@/state/periodFilter';

export type Recurrence = { name: string; amount: number };

export function useRecurrences() {
  const { mode, month, year } = usePeriod();
  const [data, setData] = useState<Recurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData([
        { name: 'Aluguel', amount: 1500 },
        { name: 'Academia', amount: 90 },
        { name: 'Internet', amount: 120 },
      ]);
      setIsLoading(false);
    }, 300);
  }, [mode, month, year]);

  return { data, isLoading };
}
