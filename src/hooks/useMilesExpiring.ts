export interface MilesExpiringData { expiringTotal: number; nextExpiryDate: string; }
export default function useMilesExpiring(): MilesExpiringData {
  return { expiringTotal: 18250, nextExpiryDate: '30/09/2025' };
}
