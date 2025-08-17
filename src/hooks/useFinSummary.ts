import { useQuery } from '@tanstack/react-query';

export interface UpcomingItem { id: string; desc: string; color: string; }
export interface FinSummaryData { saldo: number; diff: number; upcoming: UpcomingItem[]; }

async function fetchFinSummary(): Promise<FinSummaryData> {
  // Simula chamada remota
  await new Promise(r => setTimeout(r, 120));
  return {
    saldo: 12540.32,
    diff: 0.12,
    upcoming: [
      { id:'1', desc:'Cartão Nubank 10/08', color:'var(--clr-financas)' },
      { id:'2', desc:'Água', color:'#0EA5E9' },
      { id:'3', desc:'Internet', color:'#6366F1' },
      { id:'4', desc:'Aluguel', color:'#F97316' }
    ]
  };
}

export default function useFinSummary(){
  return useQuery({ queryKey:['financas','mes'], queryFn: fetchFinSummary });
}
