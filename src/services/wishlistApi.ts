import { supabase } from '@/lib/supabaseClient';

export interface PricePoint {
  id?: string;
  item_id?: string;
  price: number;
  source?: string;
  created_at?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  category: string;
  priority: number;
  status: string;
  current_price?: number;
  target_price?: number;
  image?: string;
  link?: string;
  price_points?: PricePoint[];
}

export interface FetchWishlistParams {
  status?: string;
  category?: string;
  priority?: number;
  search?: string;
}

export async function fetchWishlist(params: FetchWishlistParams = {}): Promise<WishlistItem[]> {
  let q = supabase.from('wishlist').select('*');
  if (params.status) q = q.eq('status', params.status);
  if (params.category) q = q.eq('category', params.category);
  if (typeof params.priority === 'number') q = q.eq('priority', params.priority);
  if (params.search) q = q.ilike('name', `%${params.search}%`);
  const { data, error } = await q.order('priority', { ascending: false });
  if (error) throw error;
  return (data || []) as WishlistItem[];
}

export async function upsertWishlistItem(dto: Partial<WishlistItem>): Promise<WishlistItem> {
  const { data, error } = await supabase.from('wishlist').upsert(dto).select().single();
  if (error) throw error;
  return data as WishlistItem;
}

export async function recordPricePoint(itemId: string, price: number, source?: string): Promise<PricePoint> {
  const { data, error } = await supabase
    .from('wishlist_history')
    .insert({ item_id: itemId, price, source })
    .select()
    .single();
  if (error) throw error;
  return data as PricePoint;
}

export async function getRecentDeals(days: number) {
  const { data, error } = await supabase.rpc('wishlist_recent_deals', { days });
  if (error) throw error;
  return data as unknown[];
}

export async function getWishlistProgress() {
  const { data, error } = await supabase.rpc('wishlist_progress');
  if (error) throw error;
  return data as unknown;
}

export interface MoveToShoppingResult {
  transaction_id?: number;
  miles?: {
    program: string;
    amount: number;
    expected_at: string;
  } | null;
  [key: string]: unknown;
}

export async function moveToShoppingList(args: { item_id: string; quantity?: number }) {
  const { data, error } = await supabase.rpc('wishlist_move_to_shopping', args);
  if (error) throw error;
  const result = data as MoveToShoppingResult;
  if (result?.transaction_id && result.miles) {
    try {
      await supabase.from('miles_movements').insert({
        transaction_id: result.transaction_id,
        program: result.miles.program,
        amount: result.miles.amount,
        expected_at: result.miles.expected_at,
      });
    } catch (e) {
      console.warn('Failed to insert miles movement', e);
    }
  }
  return result;
}
