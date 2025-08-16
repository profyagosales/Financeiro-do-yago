import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { KPIStat } from '../KPIStat';
vi.mock('@/components/ui/MotionCard', () => ({
  MotionCard: ({ children, className }: any) => <div data-mock="MotionCard" className={className}>{children}</div>
}));

describe('KPIStat snapshot', () => {
  it('básico', () => {
    const { container } = render(<KPIStat label="Saldo" value="R$ 10" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
