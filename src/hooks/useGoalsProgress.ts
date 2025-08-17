export interface GoalsProgressData { completed: number; total: number; percent: number; }
export default function useGoalsProgress(): GoalsProgressData {
  const completed = 5; const total = 12;
  return { completed, total, percent: (completed/total)*100 };
}
