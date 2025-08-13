import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import CategoryPicker from '@/components/CategoryPicker';
import SourcePicker, { type SourceValue } from '@/components/SourcePicker';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import MoneyInput from '@/components/MoneyInput';
import ReceiptUpload from '@/components/ReceiptUpload';

// --- Types -----------------------------------------------------------------
export type BaseData = {
  date: string;            // YYYY-MM-DD
  description: string;
  value: number;           // sempre positivo; tipo define sinal
  type: 'income' | 'expense';
  category: string;        // nome amigável (compat)
  category_id?: string | null; // id da categoria (quando houver)
  payment_method?: string; // Pix/Cartão/Dinheiro/Boleto/Transferência/Outro
  // Extensões (opcionais, para o futuro sem quebrar quem usa hoje)
  source_kind?: 'account' | 'card';
  source_id?: string | null;     // novo: id da conta/cartão
  source_label?: string | null;  // nome exibido (compat)
  installments?: number | null;  // número de parcelas, se cartão
  notes?: string | null;
  // Anexo (nota/recibo)
  attachment_file?: File | null;
};

export type Props = {
  open: boolean;
  onClose: () => void;
  initialData?: BaseData | null;
  onSubmit: (data: BaseData) => Promise<void> | void;
};

const METODOS = ['Pix','Cartão','Dinheiro','Boleto','Transferência','Outro'];

export function ModalTransacao({ open, onClose, initialData, onSubmit }: Props) {
  const { flat, byId, create, list } = useCategories();
  const { findById: findAccount } = useAccounts();
  const { byId: cardsById } = useCreditCards();

  const [form, setForm] = useState<BaseData>({
    date: new Date().toISOString().slice(0,10),
    description: '',
    value: 0,
    type: 'expense',
    category: 'Outros',
    category_id: null,
    payment_method: 'Outro',
    source_kind: 'account',
    source_id: null,
    source_label: null,
    installments: null,
    notes: null,
    attachment_file: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string | null }>({});

  // Dialog de criação rápida de categoria
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const suggestedParentId = useMemo(() => form.category_id ?? null, [form.category_id]);

  const handleChange = useCallback((key: keyof BaseData, v: any) => {
    setForm(prev => ({ ...prev, [key]: v }));
  }, []);

  const validate = useCallback((): boolean => {
    const next: { [k: string]: string | null } = {};
    // data
    if (!form.date || Number.isNaN(Date.parse(form.date))) next.date = 'Informe uma data válida (YYYY-MM-DD).';
    // descrição
    if (!form.description || !form.description.trim()) next.description = 'Descreva o lançamento.';
    // valor
    const n = Number(form.value);
    if (!(n > 0)) next.value = 'Valor deve ser maior que 0.';
    // fonte
    if (form.source_kind && !form.source_id) next.source = 'Selecione a conta ou o cartão.';
    // parcelas (apenas se cartão + despesa)
    if (form.type === 'expense' && form.source_kind === 'card' && form.installments !== null && form.installments !== undefined) {
      if (!Number.isInteger(form.installments) || (form.installments as number) < 1) {
        next.installments = 'Parcelas deve ser inteiro ≥ 1.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      const primeiroErro = Object.values(errors).find(Boolean);
      if (primeiroErro) toast.error(primeiroErro as string);
      return;
    }

    setLoading(true);
    try {
      const value = Math.abs(Number(form.value));
      const payload: BaseData = { ...form, value };
      await onSubmit(payload);
      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao salvar';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [errors, form, onClose, onSubmit, validate]);

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        attachment_file: null, // não herdamos arquivo
        date: initialData.date || new Date().toISOString().slice(0,10),
      }));
    } else {
      setForm((f) => ({ ...f, date: new Date().toISOString().slice(0,10) }));
    }
  }, [initialData, open]);

  // Atalhos: Enter (salva) e Esc (fecha) quando o diálogo está aberto
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const inInput = !!(e.target as HTMLElement)?.closest('input, textarea, [contenteditable="true"], select');
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && !inInput) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleSubmit, onClose]);

  const showInstallments = form.type === 'expense' && form.source_kind === 'card';

  // Quando usuário escolhe uma categoria no picker (id), refletimos nome e id no form
  const onCategoryPicked = useCallback((id: string | null) => {
    if (!id) {
      setForm(prev => ({ ...prev, category_id: null, category: 'Outros' }));
      return;
    }
    const cat = byId.get(id);
    setForm(prev => ({ ...prev, category_id: id, category: cat?.name || prev.category }));
  }, [byId]);

  // Criar categoria rápida
  const createCategoryQuick = useCallback(async () => {
    const name = newCatName.trim();
    if (!name) { toast.info('Digite um nome para a categoria'); return; }
    try {
      await create({ name, kind: form.type, parent_id: suggestedParentId ?? null } as any);
      await list();
      const created = flat.find(c => c.name === name && c.parent_id === (suggestedParentId ?? null));
      if (created) {
        setForm(prev => ({ ...prev, category_id: created.id, category: created.name }));
      }
      setNewCatOpen(false);
      setNewCatName('');
      toast.success('Categoria criada!');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao criar categoria');
    }
  }, [create, flat, form.type, list, newCatName, suggestedParentId]);

  // Quando escolher fonte (conta/cartão)
  const onSourcePicked = useCallback((s: SourceValue) => {
    let label: string | null = null;
    if (s.kind === 'account' && s.id) label = findAccount(s.id)?.name || null;
    if (s.kind === 'card' && s.id) label = cardsById.get(s.id)?.name || null;
    setForm(prev => ({
      ...prev,
      source_kind: s.kind,
      source_id: s.id ?? null,
      source_label: label,
      installments: s.kind === 'card' ? prev.installments : null,
    }));
  }, [cardsById, findAccount]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Data & Valor */}
          <div className="grid gap-1">
            <Label>Data</Label>
            <Input type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} />
            {errors.date && <span className="text-xs text-red-500">{errors.date}</span>}
          </div>

          <div className="grid gap-1">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex.: Mercado, Salário..."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
          </div>

          <div className="grid gap-1">
            <Label>Valor (R$)</Label>
            <MoneyInput
              value={Number(form.value) || 0}
              onChange={(n) => handleChange('value', n)}
            />
            {errors.value && <span className="text-xs text-red-500">{errors.value}</span>}
            <span className="text-xs text-slate-500">Sempre informe valor positivo — o tipo abaixo define se é receita ou despesa.</span>
          </div>

          {/* Tipo & Categoria */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v: 'income' | 'expense') => handleChange('type', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <Label>Categoria</Label>
              <CategoryPicker
                value={form.category_id ?? null}
                onChange={onCategoryPicked}
                kind={form.type}
                allowCreate
                onRequestCreate={() => setNewCatOpen(true)}
              />
            </div>
          </div>

          {/* Pagamento */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Método de pagamento</Label>
              <Select value={form.payment_method} onValueChange={(v) => handleChange('payment_method', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {METODOS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <Label>Fonte de pagamento</Label>
              <SourcePicker
                value={{ kind: form.source_kind ?? 'account', id: form.source_id ?? null }}
                onChange={onSourcePicked}
                allowCreate
              />
              {errors.source && <span className="text-xs text-red-500">{errors.source}</span>}
            </div>
          </div>

          {/* Parcelas (se cartão e despesa) */}
          {showInstallments && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label>Parcelas</Label>
                <Input
                  type="number"
                  min={1}
                  max={36}
                  value={form.installments || 1}
                  onChange={(e) => handleChange('installments', Math.max(1, Number(e.target.value || 1)))}
                />
                {errors.installments && <span className="text-xs text-red-500">{errors.installments}</span>}
              </div>
              <div className="grid gap-1">
                <Label>Observações</Label>
                <input
                  className="rounded-md border px-3 py-2 text-sm"
                  placeholder="Opcional"
                  value={form.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Anexo (nota/recibo) com OCR */}
          <div className="grid gap-1">
            <Label>Anexo (nota/recibo — PDF/Imagem)</Label>
            <ReceiptUpload
              onFileChange={(f) => handleChange('attachment_file', f)}
              onParsed={(data) => {
                if (data.description) handleChange('description', data.description);
                if (typeof data.value === 'number') handleChange('value', data.value);
                if (data.date) handleChange('date', data.date);
              }}
            />
            <span className="text-xs text-slate-500">(Opcional; tamanho máx. 5MB.)</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Dialog: Nova categoria rápida */}
      <Dialog open={newCatOpen} onOpenChange={setNewCatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova categoria ({form.type === 'income' ? 'Receita' : 'Despesa'})</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label>Nome</Label>
              <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Ex.: Streaming" />
            </div>
            {suggestedParentId && (
              <div className="text-xs text-slate-500">
                Será criada como <b>subcategoria</b> de <b>{byId.get(suggestedParentId)?.name}</b>.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewCatOpen(false)}>Cancelar</Button>
            <Button onClick={createCategoryQuick}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Dialog>
  );
}

export default ModalTransacao;