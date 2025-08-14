import { useState } from 'react';

export interface Offer {
  source: string;
  price: number;
  url: string;
}

export type CompareQuery = { name?: string; link?: string };

export async function comparePrices(query: CompareQuery): Promise<Offer[]> {
  const term = query.name ?? query.link ?? '';
  return [
    {
      source: 'Google Shopping',
      price: 100,
      url: `https://shopping.google.com/search?q=${encodeURIComponent(term)}`,
    },
    {
      source: 'Mercado Livre',
      price: 95,
      url: `https://mercadolivre.com.br/ofertas?search=${encodeURIComponent(term)}`,
    },
  ];
}

export function usePriceComparators() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (query: CompareQuery) => {
    setLoading(true);
    const res = await comparePrices(query);
    setOffers(res);
    setLoading(false);
  };

  return { offers, loading, search };
}
