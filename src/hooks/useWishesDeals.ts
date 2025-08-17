export interface Deal { id:string; title:string; }
export interface WishesDealsData { deals: Deal[]; }
export default function useWishesDeals(): WishesDealsData {
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
