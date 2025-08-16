import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ShoppingCardItem } from '../ShoppingCard';
import { ShoppingCard } from '../ShoppingCard';

const item: ShoppingCardItem = {
  id: 'abc',
  name: 'Fone de Ouvido',
  price: 199.9,
  purchased: false,
};

describe('ShoppingCard', () => {
  it('renderiza nome e preço', () => {
    render(<ShoppingCard item={item} onToggle={vi.fn()} />);
    expect(screen.getByText(/Fone de Ouvido/)).toBeInTheDocument();
    expect(screen.getByText(/199.90/)).toBeInTheDocument();
  });

  it('aciona onToggle ao alternar switch', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<ShoppingCard item={item} onToggle={onToggle} />);
  const switchEl = screen.getByRole('switch');
  await user.click(switchEl);
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: 'abc' }), true);
  });
});
