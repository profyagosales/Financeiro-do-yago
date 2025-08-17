import { useState } from 'react';

import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/Modal';

interface FormNovaTransacaoProps { close: () => void; }
function FormNovaTransacao({ close }: FormNovaTransacaoProps) {
  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); close(); }}>
      <h2 className="text-lg font-semibold">Nova transação</h2>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Descrição
          <input required name="description" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium">Valor
          <input required type="number" step="0.01" name="value" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={close}>Cancelar</Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}

export function NovaTransacaoDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>+ Nova transação</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <FormNovaTransacao close={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export default NovaTransacaoDialog;
