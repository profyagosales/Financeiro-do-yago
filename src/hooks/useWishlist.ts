import { useCallback, useEffect, useMemo, useState } from 'react';

import type { FetchWishlistParams, WishlistItem } from '@/services/wishlistApi';
import { fetchWishlist, recordPricePoint, upsertWishlistItem } from '@/services/wishlistApi';
import { supabase } from '@/lib/supabaseClient';

export function useWishlist(initialFilters: FetchWishlistParams = {}) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchWishlist(initialFilters);
    setItems(data);
    setLoading(false);
  }, [initialFilters]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createItem = async (dto: Omit<WishlistItem, 'id'>) => {
    const item = await upsertWishlistItem(dto);
    setItems((prev) => [...prev, item]);
  };

  const updateItem = async (id: string, changes: Partial<WishlistItem>) => {
    const item = await upsertWishlistItem({ ...changes, id });
    setItems((prev) => prev.map((i) => (i.id === id ? item : i)));
  };

  const deleteItem = async (id: string) => {
    await supabase.from('wishlist').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addPricePoint = async (itemId: string, price: number, source?: string) => {
    const point = await recordPricePoint(itemId, price, source);
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, price_points: [...(i.price_points ?? []), point] }
          : i,
      ),
    );
  };

  const itemsByPriority = useMemo(
    () => [...items].sort((a, b) => b.priority - a.priority),
    [items],
  );

  const itemsOnSale = useMemo(
    () => items.filter((i) => (i.current_price ?? 0) <= (i.target_price ?? Infinity)),
    [items],
  );

  const itemsStale = useMemo(() => {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    return items.filter((i) => {
      const points = i.price_points ?? [];
      if (!points.length) return true;
      const last = points[points.length - 1];
      if (!last.created_at) return true;
      return new Date().getTime() - new Date(last.created_at).getTime() > THIRTY_DAYS;
    });
  }, [items]);

  const categoryDistribution = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const promoCandidates = useMemo(
    () => items.filter((i) => i.status === 'pending' && i.priority >= 4),
    [items],
  );

  return {
    items,
    loading,
    refresh,
    createItem,
    updateItem,
    deleteItem,
    addPricePoint,
    itemsByPriority,
    itemsOnSale,
    itemsStale,
    categoryDistribution,
    promoCandidates,
  };
}

export function simulateMonthlySavings(item: WishlistItem, monthly: number) {
  const need = (item.target_price ?? 0) - (item.current_price ?? 0);
  if (monthly <= 0) return Infinity;
  return Math.max(0, Math.ceil(need / monthly));
}

export function simulateInstallments(
  price: number,
  rates: Array<{ months: number; rate: number }>,
) {
  return rates.map((r) => {
    const total = price * (1 + r.rate * r.months);
    return { months: r.months, installment: total / r.months, total };
  });
}
