import { useQuery } from '@tanstack/react-query';

export interface GoalsProgressData { completed: number; total: number; percent: number; }

async function fetchGoals(): Promise<GoalsProgressData> {
  await new Promise(r => setTimeout(r, 110));
  const completed = 5; const total = 12;
  return { completed, total, percent: (completed/total)*100 };
}

export default function useGoalsProgress(){
  return useQuery({ queryKey:['metas','status'], queryFn: fetchGoals });
}
