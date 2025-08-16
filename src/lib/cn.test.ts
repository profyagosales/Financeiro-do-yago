import { describe, expect, it } from 'vitest';

import { cn, formatCurrency } from './utils';

describe('cn', () => {
  it('mescla classes removendo duplicadas', () => {
    expect(cn('text-sm', 'font-bold', 'text-sm')).toContain('text-sm');
  });
  it('resolve conflitos tailwind mantendo a última', () => {
    const result = cn('p-2', 'p-4');
    expect(result).toContain('p-4');
    expect(result).not.toMatch(/p-2(\s|$)/);
  });
});

describe('formatCurrency locale', () => {
  it('usa locale customizado', () => {
    const en = formatCurrency(10, 'en-US', 'USD');
    expect(en).toMatch(/\$/);
  });
});
