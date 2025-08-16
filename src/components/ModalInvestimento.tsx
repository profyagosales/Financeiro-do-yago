// src/components/ModalInvestimento.tsx
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Base = {
  date: string;
  asset: string;
  type: 'Renda Fixa' | 'FII' | 'Ação' | 'Cripto';
  quantity: number;
  price: number;
};
type Props = {
  open: boolean; onClose: () => void; initialData?: Base | null;
  onSubmit: (d: Base) => Promise<void> | void;
};
const TYPES: Base['type'][] = ['Renda Fixa','FII','Ação','Cripto'];

export default function ModalInvestimento({ open, onClose, initialData, onSubmit }: Props) {
  const [form, setForm] = useState<Base>({
    date: new Date().toISOString().slice(0,10),
    asset: '', type: 'Renda Fixa', quantity: 0, price: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm((f) => ({ ...f, date: new Date().toISOString().slice(0, 10) }));
    }
  }, [initialData, open]);

  const handle = (k: keyof Base, v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try { await onSubmit({ ...form, quantity: Number(form.quantity), price: Number(form.price) }); }
    finally { setLoading(false); }
  };

  return (
  <Dialog open={open} onOpenChange={(o) => { if(!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{initialData ? 'Editar investimento' : 'Novo investimento'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1"><Label>Data</Label><Input type="date" value={form.date} onChange={e => handle('date', e.target.value)} /></div>
          <div className="grid gap-1"><Label>Ativo</Label><Input placeholder="Ex.: CDB Banco X / HGLG11 / PETR4 / BTC" value={form.asset} onChange={e => handle('asset', e.target.value)} /></div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="grid gap-1">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v: Base['type']) => handle('type', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1"><Label>Quantidade</Label><Input type="number" inputMode="decimal" value={form.quantity} onChange={e => handle('quantity', e.target.value)} /></div>
            <div className="grid gap-1"><Label>Preço (R$)</Label><Input type="number" step="0.01" inputMode="decimal" value={form.price} onChange={e => handle('price', e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={submit} disabled={loading}>{loading ? 'Salvando…' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}