import { useQuery } from '@tanstack/react-query';

export interface InvestWatchData { total: number; dailyChange: number; }

async function fetchInvestSummary(): Promise<InvestWatchData> {
  const res = await fetch('/api/invest/summary');
  if (!res.ok) throw new Error('Erro ao carregar investimentos');
  return res.json();
}

export default function useInvestWatch(){
  return useQuery({ queryKey:['invest','summary'], queryFn: fetchInvestSummary });
}
