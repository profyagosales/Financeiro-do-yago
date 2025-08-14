import type { Transaction } from './useTransactions';

// Simple moving average forecasting utilities.
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function buildDailyMap(trans: Transaction[]) {
  const map = new Map<string, number>();
  trans.forEach(t => {
    const day = (t.date || '').slice(0, 10);
    map.set(day, (map.get(day) || 0) + t.amount);
  });
  return map;
}

export type ForecastPoint = { day: number; value: number };

/**
 * Forecasts daily cashflow for the next 30 days using a moving average
 * of the last `window` days (defaults to 7).
 */
export function forecastCashflowNext30(trans: Transaction[], window = 7): ForecastPoint[] {
  const today = new Date();
  const dailyMap = buildDailyMap(trans);
  const history: number[] = [];
  for (let i = window; i > 0; i--) {
    const d = new Date(today.getTime() - i * MS_PER_DAY);
    const key = d.toISOString().slice(0, 10);
    history.push(dailyMap.get(key) || 0);
  }
  const out: ForecastPoint[] = [];
  for (let i = 1; i <= 30; i++) {
    const avg = history.slice(-window).reduce((s, v) => s + v, 0) / (window || 1);
    out.push({ day: i, value: avg });
    history.push(avg);
  }
  return out;
}

/**
 * Estimates the balance at the end of the current month based on the
 * moving average forecast.
 */
export function forecastMonthEndBalance(trans: Transaction[], window = 7) {
  const current = trans.reduce((s, t) => s + t.amount, 0);
  const forecast = forecastCashflowNext30(trans, window);
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = Math.max(0, Math.round((end.getTime() - today.getTime()) / MS_PER_DAY));
  const change = forecast.slice(0, daysLeft).reduce((s, p) => s + p.value, 0);
  return current + change;
}

