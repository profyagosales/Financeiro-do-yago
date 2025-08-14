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
