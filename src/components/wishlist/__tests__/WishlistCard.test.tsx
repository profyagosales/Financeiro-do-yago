import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import WishlistCard from '../WishlistCard';
import type { WishlistItem } from '../WishlistNewItemModal';

const baseItem: WishlistItem = {
  id: '1',
  titulo: 'Notebook Gamer',
  link: '',
  vendedor: 'Loja X',
  categoria: 'Eletrônicos',
  prioridade: 'Alta',
  precoAlvo: 7000,
  precoAtual: 5000,
  imagem: '',
  notas: '',
  alertas: true,
};

describe('WishlistCard', () => {
  it('renderiza dados principais e calcula progresso', () => {
    render(
      <WishlistCard
        item={baseItem}
        onMoveToPurchases={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onExportPdf={vi.fn()}
      />
    );
    expect(screen.getByText(/Notebook Gamer/)).toBeInTheDocument();
  const progress = screen.getByRole('progressbar');
  expect(progress).toHaveAttribute('aria-valuenow', '71');
  });

  it('aciona callbacks dos botões', async () => {
    const onMove = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onExport = vi.fn();
    const user = userEvent.setup();
    render(
      <WishlistCard
        item={baseItem}
        onMoveToPurchases={onMove}
        onEdit={onEdit}
        onDelete={onDelete}
        onExportPdf={onExport}
      />
    );
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    await user.click(buttons[1]);
    await user.click(buttons[2]);
    await user.click(buttons[3]);
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});
