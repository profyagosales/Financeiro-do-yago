import { describe, expect, it } from 'vitest';

import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('formata número positivo em BRL', () => {
    const s = formatCurrency(1234.56);
    expect(s).toMatch(/R\$/);
  });

  it('formata zero', () => {
    expect(formatCurrency(0)).toContain('0');
  });

  it('formata negativo', () => {
    const s = formatCurrency(-50);
    expect(s).toMatch(/-?\d/);
  });
});
