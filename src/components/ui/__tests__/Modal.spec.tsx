import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from '../Modal';

describe('Modal', () => {
  it('não renderiza quando open=false', () => {
    const { container } = render(<Modal open={false} onClose={() => {}}>Oi</Modal>);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renderiza conteúdo quando open=true', () => {
    render(<Modal open onClose={() => {}}><div>Conteúdo Modal</div></Modal>);
    expect(screen.getByText('Conteúdo Modal')).toBeInTheDocument();
  });

  it('chama onClose ao clicar no overlay', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}><div>Fechar</div></Modal>);
    const overlay = screen.getByRole('dialog').parentElement!;
    fireEvent.mouseDown(overlay);
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });
});
