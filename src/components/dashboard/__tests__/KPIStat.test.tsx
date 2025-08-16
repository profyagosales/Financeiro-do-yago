import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { KPIStat } from '../KPIStat';
vi.mock('@/components/ui/MotionCard', () => ({
  MotionCard: ({ children, className }: any) => <div data-mock="MotionCard" className={className}>{children}</div>
}));

describe('KPIStat', () => {
  it('renderiza label e valor', () => {
    const { getByText } = render(<KPIStat label="Entradas" value="R$ 100" />);
    expect(getByText('Entradas')).toBeTruthy();
    expect(getByText('R$ 100')).toBeTruthy();
  });
  it('aplica estado loading', () => {
    const { getByText } = render(<KPIStat label="Saldo" value="R$ 0" loading />);
    expect(getByText('R$ 0').className).toMatch(/opacity-50/);
  });
});
