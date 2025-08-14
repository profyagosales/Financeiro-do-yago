import { useEffect, useState } from 'react';

import { usePeriod } from '@/state/periodFilter';

export type ForecastPoint = { label: string; in: number; out: number };

export function useForecast() {
  const { mode, month, year } = usePeriod();
  const [data, setData] = useState<ForecastPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Placeholder: create simple forecast for next months based on period
    setTimeout(() => {
      const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      const base = Array.from({ length: 6 }).map((_, i) => {
        const m = (month - 6 + i + 12) % 12;
        return {
          label: months[m],
          in: 4000 + i * 200,
          out: 2000 + i * 150,
        };
      });
      setData(base);
      setIsLoading(false);
    }, 300);
  }, [mode, month, year]);

  return { data, isLoading };
}
