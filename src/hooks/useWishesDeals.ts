import { useQuery } from '@tanstack/react-query';

export interface Deal { id:string; title:string; }
export interface WishesDealsData { deals: Deal[]; }

async function fetchDeals(): Promise<WishesDealsData> {
  const res = await fetch('/api/desejos/deals');
  if (!res.ok) throw new Error('Erro ao carregar desejos');
  return res.json();
}

export default function useWishesDeals(){
  return useQuery({ queryKey:['desejos','deals'], queryFn: fetchDeals });
}
