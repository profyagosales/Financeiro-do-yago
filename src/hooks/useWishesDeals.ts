import { useQuery } from '@tanstack/react-query';

export interface Deal { id:string; title:string; }
export interface WishesDealsData { deals: Deal[]; }

async function fetchDeals(): Promise<WishesDealsData> {
  await new Promise(r => setTimeout(r, 80));
  return {
    deals: [
      { id:'1', title:'Kindle em promoção' },
      { id:'2', title:'Monitor 27 144Hz' },
      { id:'3', title:'Fone ANC' },
      { id:'4', title:'Notebook upgrade' },
      { id:'5', title:'Teclado mecânico' }
    ]
  };
}

export default function useWishesDeals(){
  return useQuery({ queryKey:['desejos','deals'], queryFn: fetchDeals });
}
