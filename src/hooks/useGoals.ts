import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { supabase } from '@/lib/supabaseClient';

export type Goal = {
  id: number; user_id: string; title: string; description?: string | null;
  category?: string | null; priority?: number | null;
  target_value: number; deadline: string; expected_rate?: number | null;
  status: 'active'|'archived'|'completed';
  created_at: string; updated_at: string;
};

export type GoalRow = Goal & {
  contributed: number;
  progress_pct: number;
  months_remaining: number;
  days_remaining: number;
  suggested_monthly: number;
  health_hint: 'done' | 'late' | 'risk_or_track';
};

export type NewGoal = Omit<Goal, 'id'|'user_id'|'created_at'|'updated_at'>;

export function useGoals() {
  const [data, setData] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true); setError(null);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) { setData([]); setLoading(false); return; }

    const { data: rows, error } = await supabase
      .from('goals_progress_v')
      .select('*')
      .eq('user_id', uid)
      .order('deadline', { ascending: true });

    if (error) setError(error.message);
    setData(rows as GoalRow[] ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  const add = async (g: NewGoal) => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    const { error } = await supabase.from('goals').insert({ ...g, user_id: uid });
    if (error) throw error;
    await fetchAll();
  };

  const update = async (id: number, g: Partial<NewGoal>) => {
    const { error } = await supabase.from('goals').update(g).eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  const remove = async (id: number) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  const contribute = async (goal_id: number, amount: number, date: string, note?: string) => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    const { error } = await supabase.from('goal_contributions').insert({
      goal_id, user_id: uid, amount, date, note: note ?? null
    });
    if (error) throw error;
    await fetchAll();
  };

  return { data, loading, error, add, update, remove, contribute, refetch: fetchAll };
}

/* Helpers */
export function statusFrom(row: GoalRow) {
  if (row.health_hint === 'done') return { key: 'done', label: 'Concluída', color: 'bg-emerald-600' };
  if (row.health_hint === 'late') return { key: 'late', label: 'Atrasada', color: 'bg-rose-600' };
  // Heurística simples: se faltam <= 60 dias e progresso < 70% ⇒ risco; senão no prazo
  const pct = row.progress_pct || 0;
  const risk = row.days_remaining <= 60 && pct < 70;
  return risk
    ? { key: 'risk', label: 'Em risco', color: 'bg-amber-500' }
    : { key: 'track', label: 'No prazo', color: 'bg-sky-600' };
}

export const brl = (v: number) =>
  (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const fmtDate = (d?: string | null) => d ? dayjs(d).format('DD/MM/YYYY') : '-';