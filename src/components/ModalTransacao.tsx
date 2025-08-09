import { useEffect, useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import MoneyInput from './MoneyInput';
import SourcePicker from './SourcePicker';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';

export type FormData = {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category_parent: string | null;
  category_id: string | null;
  source: { kind: 'account' | 'card'; id: string | null };
  installments: number;
  notes: string;
  attachment_file: File | null;
  from_account_id: string | null;
  to_account_id: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<FormData> | null;
  onSubmit: (data: any) => Promise<void> | void;
};

const defaultForm: FormData = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  amount: 0,
  type: 'expense',
  category_parent: null,
  category_id: null,
  source: { kind: 'account', id: null },
  installments: 1,
  notes: '',
  attachment_file: null,
  from_account_id: null,
  to_account_id: null,
};

const schema = z
  .object({
    date: z.string().min(1, 'Informe a data'),
    description: z.string().min(1, 'Informe a descrição'),
    amount: z.number().positive('Informe um valor válido'),
    type: z.enum(['income', 'expense', 'transfer']),
    category_parent: z.string().nullable(),
    category_id: z.string().nullable(),
    source: z.object({ kind: z.enum(['account', 'card']), id: z.string().nullable() }),
    installments: z.number().int().min(1).max(24),
    notes: z.string().optional(),
    attachment_file: z.any().nullable(),
    from_account_id: z.string().nullable(),
    to_account_id: z.string().nullable(),
  })
  .superRefine((d, ctx) => {
    if (d.type === 'transfer') {
      if (!d.from_account_id) ctx.addIssue({ code: 'custom', path: ['from_account_id'], message: 'Selecione a conta de origem' });
      if (!d.to_account_id) ctx.addIssue({ code: 'custom', path: ['to_account_id'], message: 'Selecione a conta destino' });
    } else {
      if (!d.category_id && !d.category_parent)
        ctx.addIssue({ code: 'custom', path: ['category_id'], message: 'Selecione a categoria' });
      if (!d.source.id)
        ctx.addIssue({ code: 'custom', path: ['source'], message: 'Selecione conta ou cartão' });
    }
  });

export function ModalTransacao({ open, onClose, initialData, onSubmit }: Props) {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { data: accounts } = useAccounts();
  const { flat: categories } = useCategories();

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...defaultForm, ...initialData, amount: initialData?.amount ?? 0 }));
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (key: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const parentCats = categories.filter((c) => c.parent_id === null && c.kind === form.type);
  const subCats = categories.filter((c) => c.parent_id === form.category_parent);

  const handleSubmit = async () => {
    const parse = schema.safeParse(form);
    if (!parse.success) {
      const fieldErrors: Record<string, string> = {};
      parse.error.issues.forEach((i) => {
        const k = i.path[0] as string;
        fieldErrors[k] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    const data = parse.data;
    try {
      if (data.type === 'transfer') {
        // Abordagem simples: gera duas transações (saída e entrada) na tabela `transactions`.
        const amount = data.amount;
        const rows = [
          {
            date: data.date,
            description: data.description,
            amount: -amount,
            account_id: data.from_account_id,
            category_id: null,
            notes: data.notes || null,
          },
          {
            date: data.date,
            description: data.description,
            amount: amount,
            account_id: data.to_account_id,
            category_id: null,
            notes: data.notes || null,
          },
        ];
        await onSubmit(rows);
        toast.success('Transferência registrada!');
      } else {
        const amount = data.type === 'expense' ? -data.amount : data.amount;
        const payload: any = {
          date: data.date,
          description: data.description,
          amount,
          category_id: data.category_id || data.category_parent,
          notes: data.notes || null,
          attachment_file: data.attachment_file || null,
        };
        if (data.source.kind === 'account') payload.account_id = data.source.id;
        else payload.card_id = data.source.id;
        if (data.source.kind === 'card') payload.installment_total = data.installments;
        await onSubmit(payload);
        toast.success('Transação salva!');
      }
      onClose();
    } catch (e: any) {
      console.error(e);
      toast.error('Erro ao salvar', { description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  const showInstallments = form.type === 'expense' && form.source.kind === 'card';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-sm" />
        <DialogContent className="sm:max-w-lg">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <DialogHeader>
              <DialogTitle>{initialData ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-1">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} />
                {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
              </div>

              <div className="grid gap-1">
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>

              <div className="grid gap-1">
                <Label>Valor</Label>
                <MoneyInput value={form.amount} onChange={(v) => handleChange('amount', v)} autoFocus />
                {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
              </div>

              <div className="grid gap-1">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v: any) => handleChange('type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.type !== 'transfer' && (
                <>
                  <div className="grid gap-1">
                    <Label>Categoria</Label>
                    <select
                      className="w-full rounded-xl border border-white/30 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/50"
                      value={form.category_parent || ''}
                      onChange={(e) => handleChange('category_parent', e.target.value || null)}
                    >
                      <option value="">Selecione</option>
                      {parentCats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {subCats.length > 0 && (
                    <div className="grid gap-1">
                      <Label>Subcategoria</Label>
                      <select
                        className="w-full rounded-xl border border-white/30 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/50"
                        value={form.category_id || ''}
                        onChange={(e) => handleChange('category_id', e.target.value || null)}
                      >
                        <option value="">Selecione</option>
                        {subCats.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
                    </div>
                  )}

                  <div className="grid gap-1">
                    <Label>Fonte de pagamento</Label>
                    <SourcePicker value={form.source} onChange={(s) => handleChange('source', s)} />
                    {errors.source && <p className="text-xs text-red-500">{errors.source}</p>}
                  </div>
                </>
              )}

              {form.type === 'transfer' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <Label>De</Label>
                    <select
                      className="w-full rounded-xl border border-white/30 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/50"
                      value={form.from_account_id || ''}
                      onChange={(e) => handleChange('from_account_id', e.target.value || null)}
                    >
                      <option value="">Selecione</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    {errors.from_account_id && <p className="text-xs text-red-500">{errors.from_account_id}</p>}
                  </div>
                  <div className="grid gap-1">
                    <Label>Para</Label>
                    <select
                      className="w-full rounded-xl border border-white/30 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/50"
                      value={form.to_account_id || ''}
                      onChange={(e) => handleChange('to_account_id', e.target.value || null)}
                    >
                      <option value="">Selecione</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    {errors.to_account_id && <p className="text-xs text-red-500">{errors.to_account_id}</p>}
                  </div>
                </div>
              )}

              {showInstallments && (
                <div className="grid gap-1">
                  <Label>Parcelas</Label>
                  <Select value={String(form.installments)} onValueChange={(v) => handleChange('installments', Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-1">
                <Label>Observações</Label>
                <Input value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
              </div>

              <div className="grid gap-1">
                <Label>Anexo (PDF/JPG/PNG)</Label>
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={(e) => handleChange('attachment_file', e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Salvando…' : 'Salvar'}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
