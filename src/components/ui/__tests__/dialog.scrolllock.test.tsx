import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../dialog';

function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger data-testid="trigger">open</DialogTrigger>
      {open && (
        <DialogContent>
          <DialogTitle>Teste de Dialog</DialogTitle>
          <DialogDescription>Verifica lock de scroll</DialogDescription>
          <div>Modal body</div>
        </DialogContent>
      )}
    </Dialog>
  );
}

describe('Dialog scroll-lock', () => {
  it('bloqueia scroll do body enquanto aberto', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    expect(document.body.style.overflow).not.toBe('hidden');
    await user.click(screen.getByTestId('trigger'));
    // corpo deve estar travado
    expect(document.body.style.overflow).toBe('hidden');
  });
});
