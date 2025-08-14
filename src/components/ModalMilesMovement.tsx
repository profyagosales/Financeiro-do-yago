import { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export type MilesMovement = {
  id: string;
  date: string;             // YYYY-MM-DD
  kind: 'earn' | 'redeem';
  points: number;           // positivo
  partner?: string;
  expires_at?: string | null; // YYYY-MM-DD
  note?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<MilesMovement> | null;
  onSubmit: (data: Omit<MilesMovement, 'id'>) => Promise<void> | void;
};

export default function ModalMilesMovement({ open, onClose, initial, onSubmit }: Props) {
  const [form, setForm] = useState<Omit<MilesMovement, 'id'>>({
    date: new Date().toISOString().slice(0,10),
    kind: 'earn',
    points: 0,
    partner: '',
    expires_at: null,
    note: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm(f => ({
        ...f,
        date: (initial.date ?? new Date().toISOString().slice(0,10)) as string,
        kind: (initial.kind ?? 'earn') as 'earn'|'redeem',
        points: Number(initial.points ?? 0),
        partner: initial.partner ?? '',
        expires_at: (initial.expires_at ?? null) as string | null,
        note: initial.note ?? '',
      }));
    } else {
      setForm({
        date: new Date().toISOString().slice(0,10),
        kind: 'earn',
        points: 0,
        partner: '',
        expires_at: null,
        note: '',
      });
    }
  }, [initial, open]);

  const set = (k: keyof Omit<MilesMovement,'id'>, v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.date || Number.isNaN(Number(form.points))) return;
    setLoading(true);
    try { await onSubmit({ ...form, points: Number(form.points) }); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar movimento' : 'Novo movimento'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1">
            <Label>Data</Label>
            <Input type="date" value={form.date} onChange={(e)=>set('date', e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="grid gap-1">
              <Label>Tipo</Label>
              <Select value={form.kind} onValueChange={(v: 'earn'|'redeem') => set('kind', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="earn">Ganhos</SelectItem>
                  <SelectItem value="redeem">Resgates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Pontos</Label>
              <Input type="number" inputMode="numeric" value={form.points} onChange={(e)=>set('points', e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Expira em</Label>
              <Input type="date" value={form.expires_at ?? ''} onChange={(e)=>set('expires_at', e.target.value || null)} />
            </div>
          </div>

          <div className="grid gap-1">
            <Label>Parceiro/Origem</Label>
            <Input placeholder="Ex.: Compra, Cartão XP, Promo 100%..." value={form.partner ?? ''} onChange={(e)=>set('partner', e.target.value)} />
          </div>

          <div className="grid gap-1">
            <Label>Observação</Label>
            <Input placeholder="Notas opcionais" value={form.note ?? ''} onChange={(e)=>set('note', e.target.value)} />
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