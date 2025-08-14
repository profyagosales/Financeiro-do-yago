import dayjs from "dayjs";

import type { UITransaction } from "@/components/TransactionsTable";

/**
 * Simple moving average for a series of numbers.
 */
export function simpleMovingAverage(points: number[], window: number) {
  const out: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = points.slice(start, i + 1);
    const avg = slice.reduce((s, v) => s + v, 0) / (slice.length || 1);
    out.push(avg);
  }
  return out;
}

/**
 * Moving average with a configurable window (defaults to 7).
 *
 * Unlike `simpleMovingAverage`, this helper provides a default
 * window size so callers don't need to specify one for common
 * use-cases.
 */
export function movingAverage(values: number[], window = 7) {
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    const avg = slice.reduce((sum, v) => sum + v, 0) / (slice.length || 1);
    out.push(avg);
  }
  return out;
}

/**
 * Exponential moving average for a series.
 */
export function exponentialMovingAverage(points: number[], alpha: number) {
  const out: number[] = [];
  points.forEach((p, idx) => {
    if (idx === 0) out.push(p);
    else out.push(alpha * p + (1 - alpha) * out[idx - 1]);
  });
  return out;
}

/**
 * Indicates if the latest price is below the EMA of previous values,
 * suggesting a possible price drop and a good moment to buy.
 */
export function priceDropLikely(history: number[]) {
  if (history.length < 2) return false;
  const ema = exponentialMovingAverage(history.slice(0, -1), 0.3);
  const last = history[history.length - 1];
  const prev = ema[ema.length - 1];
  return last < prev;
}


/**
 * Generates a 30 day forecast based on historical transactions.
 *
 * The forecast uses the moving average of the latest values and
 * iteratively projects the next 30 days.
 */
export function forecast30d(transactions: UITransaction[]) {
  if (!Array.isArray(transactions)) return { series: [], total: 0 };

  // group transactions by date (YYYY-MM-DD) and compute net daily value
  const daily = new Map<string, number>();
  for (const t of transactions) {
    const value = t.type === "income" ? t.value : -t.value;
    daily.set(t.date, (daily.get(t.date) || 0) + value);
  }

  const dates = Array.from(daily.keys()).sort();
  if (dates.length === 0) {
    const start = dayjs();
    const series = Array.from({ length: 30 }, (_, i) => ({
      date: start.add(i + 1, "day").format("YYYY-MM-DD"),
      value: 0,
    }));
    return { series, total: 0 };
  }

  // fill missing days with 0 to maintain continuity
  const startDate = dayjs(dates[0]);
  const endDate = dayjs(dates[dates.length - 1]);
  const values: number[] = [];
  for (let d = startDate; !d.isAfter(endDate); d = d.add(1, "day")) {
    const key = d.format("YYYY-MM-DD");
    values.push(daily.get(key) || 0);
  }

  // forecast next 30 days iteratively using moving average
  const series: { date: string; value: number }[] = [];
  let lastDate = endDate;
  for (let i = 0; i < 30; i++) {
    const ma = movingAverage(values);
    const next = ma[ma.length - 1] || 0;
    lastDate = lastDate.add(1, "day");
    series.push({ date: lastDate.format("YYYY-MM-DD"), value: next });
    values.push(next);
  }

  const total = series.reduce((sum, s) => sum + s.value, 0);
  return { series, total };
}
