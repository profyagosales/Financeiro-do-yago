export interface Investment {
  id: number;
  user_id: string;      // preenchido no backend
  asset: string;
  type: string;         // stock | fii | crypto…
  quantity: number;
  price: number;
  date: string;         // YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
}