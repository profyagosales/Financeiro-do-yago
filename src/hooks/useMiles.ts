import { useCallback } from 'react';

import { supabase } from '@/lib/supabaseClient';

export type PendingMilesInput = {
  transaction_id: number;
  program: string;
  qty: number;
  expected_at: string;
};

export function useMiles() {
  const recordPending = useCallback(async ({ transaction_id, program, qty, expected_at }: PendingMilesInput) => {
    const { data, error } = await supabase
      .from('miles')
      .insert({ transaction_id, program, qty, expected_at, status: 'pending' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }, []);

  return { recordPending } as const;
}

