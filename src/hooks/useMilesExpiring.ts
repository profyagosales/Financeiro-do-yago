import { useQuery } from '@tanstack/react-query';

export interface MilesExpiringData { expiringTotal: number; nextExpiryDate: string; }

async function fetchMiles(): Promise<MilesExpiringData> {
  await new Promise(r => setTimeout(r, 90));
  return { expiringTotal: 18250, nextExpiryDate: '30/09/2025' };
}

export default function useMilesExpiring(){
  return useQuery({ queryKey:['milhas','expiring'], queryFn: fetchMiles });
}
