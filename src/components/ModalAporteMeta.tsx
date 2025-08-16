import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number, date: string, note?: string) => Promise<void> | void;
  initial?: { amount?: number; date?: string; note?: string } | null;
};

export default function ModalAporteMeta({ open, onClose, onSubmit, initial }: Props) {
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAmount(Number(initial?.amount ?? 0));
    setDate(initial?.date ?? new Date().toISOString().slice(0,10));
    setNote(initial?.note ?? '');
  }, [initial, open]);

  const submit = async () => {
    if (!amount || Number.isNaN(Number(amount))) return;
    setLoading(true);
    try { await onSubmit(Number(amount), date, note || undefined); }
    finally { setLoading(false); }
  };

  return (
  <Dialog open={open} onOpenChange={(o)=>{ if(!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Novo aporte</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1">
            <Label>Valor (R$)</Label>
            <Input type="number" step="0.01" inputMode="decimal" value={amount} onChange={(e)=>setAmount(Number(e.target.value))} />
          </div>
          <div className="grid gap-1">
            <Label>Data</Label>
            <Input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Observação (opcional)</Label>
            <Input value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Ex.: transferência, ajuste..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={submit} disabled={loading}>{loading ? 'Salvando…' : 'Adicionar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}