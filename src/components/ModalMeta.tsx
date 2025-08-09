import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type Base = {
  title: string;
  target_value: number;
  deadline: string; // YYYY-MM-DD
  category?: string | null;
  priority?: number | null; // 1..5
  description?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Base | null;
  onSubmit: (g: Base) => Promise<void> | void;
};

const CATS = ['Viagem','Reserva','Curso','Casa','Carro','Outro'];

export default function ModalMeta({ open, onClose, initial, onSubmit }: Props) {
  const [form, setForm] = useState<Base>({
    title: '',
    target_value: 0,
    deadline: new Date().toISOString().slice(0,10),
    category: 'Outro',
    priority: 3,
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) setForm(initial);
    else setForm(f => ({ ...f, deadline: new Date().toISOString().slice(0,10) }));
  }, [initial, open]);

  const set = (k: keyof Base, v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.title || !form.target_value || !form.deadline) return;
    setLoading(true);
    try { await onSubmit({ ...form, target_value: Number(form.target_value) }); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o)=>!o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{initial ? 'Editar meta' : 'Nova meta'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1">
            <Label>Título</Label>
            <Input value={form.title} onChange={(e)=>set('title', e.target.value)} placeholder="Ex.: Viagem 2026" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Valor alvo (R$)</Label>
              <Input type="number" inputMode="decimal" value={form.target_value} onChange={(e)=>set('target_value', e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Prazo</Label>
              <Input type="date" value={form.deadline} onChange={(e)=>set('deadline', e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Categoria</Label>
              <Select value={form.category ?? 'Outro'} onValueChange={(v)=>set('category', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Prioridade</Label>
              <Select value={String(form.priority ?? 3)} onValueChange={(v)=>set('priority', Number(v))}>
                <SelectTrigger><SelectValue placeholder="3 (padrão)" /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1">
            <Label>Descrição (opcional)</Label>
            <Input value={form.description ?? ''} onChange={(e)=>set('description', e.target.value)} placeholder="Notas, links..." />
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