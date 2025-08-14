import { useEffect, useState } from 'react';

import { usePeriod } from '@/state/periodFilter';

export type Alert = { message: string };

export function useAlerts() {
  const { mode, month, year } = usePeriod();
  const [data, setData] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData([
        { message: 'Conta de luz vence em 3 dias' },
        { message: 'Orçamento de lazer excedido' },
      ]);
      setIsLoading(false);
    }, 300);
  }, [mode, month, year]);

  return { data, isLoading };
}
