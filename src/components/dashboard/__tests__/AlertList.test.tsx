import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AlertList from '../AlertList';

describe('AlertList', () => {
  it('mostra estado vazio com aria-live', () => {
    render(<AlertList items={[]} />);
    const empty = screen.getByText('Nenhuma conta a vencer');
    expect(empty).not.toBeNull();
    const liveRegion = empty.closest('[aria-live]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
  });

  it('renderiza itens', () => {
    render(<AlertList items={[{ nome: 'Internet', vencimento: '2025-01-10', valor: 100 }]} />);
    expect(screen.getByText('Internet')).not.toBeNull();
  });
});
