import { useState } from 'react';
import dayjs from 'dayjs';
import { supabase } from '@/lib/supabaseClient';
import {
  Transaction,
  TransactionInput,
  TransactionInputSchema,
  TransactionSchema,
} from '@/types/finance';

export interface TransactionFilters {
  categoryId?: string;
  sourceType?: 'account' | 'card';
  sourceId?: string;
}

export function useTransactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const listByPeriod = async (
    userId: string,
    start: string,
    end: string,
    filters: TransactionFilters = {},
  ) => {
    setLoading(true);
    let q = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true });
    if (filters.categoryId) q = q.eq('category_id', filters.categoryId);
    if (filters.sourceType) q = q.eq('source_type', filters.sourceType);
    if (filters.sourceId) q = q.eq('source_id', filters.sourceId);
    const { data, error } = await q;
    if (error) throw error;
    setData(data as Transaction[]);
    setLoading(false);
    return data as Transaction[];
  };

  const add = async (payload: TransactionInput) => {
    const parsed = TransactionInputSchema.parse(payload);
    const installments = parsed.installments_total ?? 1;
    const rows: any[] = [];
    for (let i = 0; i < installments; i++) {
      const date = dayjs(parsed.date).add(i, 'month').format('YYYY-MM-DD');
      rows.push({
        ...parsed,
        date,
        installment_no: installments > 1 ? i + 1 : null,
        installments_total: installments > 1 ? installments : null,
        parent_installment_id: null,
      });
    }
    const { data, error } = await supabase
      .from('transactions')
      .insert(rows)
      .select();
    if (error) throw error;
    const inserted = (data || []) as Transaction[];
    if (installments > 1 && inserted.length > 0) {
      const parentId = inserted[0].id;
      const ids = inserted.map((t) => t.id);
      await supabase
        .from('transactions')
        .update({ parent_installment_id: parentId })
        .in('id', ids);
      inserted.forEach((t) => (t.parent_installment_id = parentId));
    }
    setData((d) => [...d, ...inserted]);
    return inserted;
  };

  const update = async (id: number, patch: Partial<Transaction>) => {
    const parsed = TransactionSchema.omit({ id: true, user_id: true })
      .partial()
      .parse(patch);
    const { data, error } = await supabase
      .from('transactions')
      .update(parsed)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setData((d) => d.map((t) => (t.id === id ? (data as Transaction) : t)));
  };

  const remove = async (id: number) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    setData((d) => d.filter((t) => t.id !== id));
  };

  const ensureBucket = async () => {
    const { data: bucket } = await supabase.storage.getBucket('receipts');
    if (!bucket) {
      await supabase.storage.createBucket('receipts', { public: true });
    }
  };

  const uploadAttachment = async (id: number, file: File) => {
    await ensureBucket();
    const filePath = `${id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('receipts').upload(filePath, file, {
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
    const url = data.publicUrl;
    await supabase
      .from('transactions')
      .update({ attachment_url: url })
      .eq('id', id);
    setData((d) => d.map((t) => (t.id === id ? { ...t, attachment_url: url } : t)));
    return url;
  };

  return { data, loading, listByPeriod, add, update, remove, uploadAttachment };
}
