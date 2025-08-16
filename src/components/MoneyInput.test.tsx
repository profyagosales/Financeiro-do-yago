import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import MoneyInput from './MoneyInput';

describe('MoneyInput', () => {
  it('formata valor inicial', () => {
    const handle = vi.fn();
    render(<MoneyInput value={1234.5} onChange={handle} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toMatch(/1.234,50/);
  });

  it('atualiza onChange ao digitar e normaliza ao blur', () => {
    let value = 0;
    const handle = (v: number) => { value = v; };
    render(<MoneyInput value={value} onChange={handle} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2.500,7' } });
    expect(value).toBeCloseTo(2500.7);
    fireEvent.blur(input);
    expect(input.value).toBe('2.500,70');
  });
});
