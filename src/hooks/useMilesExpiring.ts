import { useQuery } from '@tanstack/react-query';

export interface MilesExpiringData { expiringTotal: number; nextExpiryDate: string; }

async function fetchMiles(): Promise<MilesExpiringData> {
  const res = await fetch('/api/milhas/expiring');
  if (!res.ok) throw new Error('Erro ao carregar milhas');
  return res.json();
}

export default function useMilesExpiring(){
  return useQuery({ queryKey:['milhas','expiring'], queryFn: fetchMiles });
}
