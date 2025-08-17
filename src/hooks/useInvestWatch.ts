import { useQuery } from '@tanstack/react-query';

export interface InvestWatchData { total: number; dailyChange: number; }

async function fetchInvestSummary(): Promise<InvestWatchData> {
  await new Promise(r => setTimeout(r, 100));
  return { total: 84500.22, dailyChange: -0.0065 };
}

export default function useInvestWatch(){
  return useQuery({ queryKey:['invest','summary'], queryFn: fetchInvestSummary });
}
