import { useQuery } from '@tanstack/react-query';

export interface GoalsProgressData { completed: number; total: number; percent: number; }

async function fetchGoals(): Promise<GoalsProgressData> {
  const res = await fetch('/api/metas/status');
  if (!res.ok) throw new Error('Erro ao carregar metas');
  return res.json();
}

export default function useGoalsProgress(){
  return useQuery({ queryKey:['metas','status'], queryFn: fetchGoals });
}
