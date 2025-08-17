export interface UpcomingItem { id: string; desc: string; color: string; }
export interface FinSummaryData { saldo: number; diff: number; upcoming: UpcomingItem[]; }

export default function useFinSummary(): FinSummaryData {
  return {
    saldo: 12540.32,
    diff: 0.12, // 12%
    upcoming: [
      { id:'1', desc:'Cartão Nubank 10/08', color:'var(--clr-financas)' },
      { id:'2', desc:'Água', color:'#0EA5E9' },
      { id:'3', desc:'Internet', color:'#6366F1' },
      { id:'4', desc:'Aluguel', color:'#F97316' }
    ]
  };
}
