import { describe, expect, it } from 'vitest';

import { movingAverage, forecast30d } from './forecast';

describe('movingAverage', () => {
  it('computes averages with default window', () => {
    const result = movingAverage([1, 2, 3, 4, 5, 6, 7]);
    expect(result).toEqual([1, 1.5, 2, 2.5, 3, 3.5, 4]);
  });
});

describe('forecast30d', () => {
  it('forecasts constant trend using moving average', () => {
    const transactions = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      date: `2025-01-${(i + 1).toString().padStart(2, '0')}`,
      description: '',
      value: 10,
      type: 'income' as const,
    }));
    const { series, total } = forecast30d(transactions);
    expect(series).toHaveLength(30);
    expect(series.every(s => s.value === 10)).toBe(true);
    expect(total).toBe(300);
  });
});
