import { useQuery } from '@tanstack/react-query';

export interface UpcomingItem { id: string; desc: string; color: string; }
export interface FinSummaryData { saldo: number; diff: number; upcoming: UpcomingItem[]; }

async function fetchFinSummary(): Promise<FinSummaryData> {
  const res = await fetch('/api/financas/mes');
  if (!res.ok) throw new Error('Erro ao carregar finanças');
  return res.json();
}

export default function useFinSummary(){
  return useQuery({ queryKey:['financas','mes'], queryFn: fetchFinSummary });
}
