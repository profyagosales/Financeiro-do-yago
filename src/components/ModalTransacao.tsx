import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CategoryPicker from '@/components/CategoryPicker';
import MoneyInput from '@/components/MoneyInput';
import SourcePicker, { type SourceValue } from '@/components/SourcePicker';
import { toast } from '@/components/ui/Toasts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useCreditCards } from '@/hooks/useCreditCards';
import type { ShoppingItem } from '@/hooks/useTransactions';

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
  // Milhas (opcional)
  miles?: {
    program: 'livelo' | 'latampass' | 'azul';
    amount: number;
    expected_at: string; // YYYY-MM-DD
  } | null;
};

export type Props = {
  open: boolean;
  onClose: () => void; // manter compat externo
  initialData?: BaseData | null;
  onSubmit: (data: BaseData) => Promise<void> | void;
};

export function baseDataFromShoppingItem(item: ShoppingItem, pricePaid?: number): BaseData {
  return {
    date: new Date().toISOString().slice(0, 10),
    description: item.title,
    value: pricePaid ?? item.price ?? item.estimated_price ?? 0,
    type: 'expense',
    category: 'Outros',
    category_id: item.wishlist_category_id ?? item.category_id ?? null,
    payment_method: 'Outro',
    source_kind: 'account',
    source_id: null,
    source_label: null,
    installments: null,
    notes: null,
    attachment_file: null,
    miles:
      item.accumulates_miles &&
      item.miles_program &&
      item.miles_qty &&
      item.miles_expected_at
        ? {
            program: item.miles_program as any,
            amount: item.miles_qty,
            expected_at: item.miles_expected_at,
          }
        : null,
  };
}

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

  // Milhas
  const [addMiles, setAddMiles] = useState(false);
  const [milesProgram, setMilesProgram] = useState<'livelo' | 'latampass' | 'azul' | ''>('');
  const [milesQty, setMilesQty] = useState<number | ''>('');
  const [milesWhen, setMilesWhen] = useState<string>(dayjs().add(30, 'day').format('YYYY-MM-DD'));

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
      if (addMiles && milesProgram && milesQty && milesWhen) {
        payload.miles = {
          program: milesProgram,
          amount: Number(milesQty),
          expected_at: milesWhen,
        };
      }
      await onSubmit(payload);
      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao salvar';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [addMiles, milesProgram, milesQty, milesWhen, errors, form, onClose, onSubmit, validate]);

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        attachment_file: null, // não herdamos arquivo
        date: initialData.date || new Date().toISOString().slice(0,10),
      }));
      if (initialData.miles) {
        setAddMiles(true);
        setMilesProgram(initialData.miles.program);
        setMilesQty(initialData.miles.amount);
        setMilesWhen(initialData.miles.expected_at);
      } else {
        setAddMiles(false);
        setMilesProgram('');
        setMilesQty('');
        setMilesWhen(dayjs().add(30, 'day').format('YYYY-MM-DD'));
      }
    } else {
      setForm((f) => ({ ...f, date: new Date().toISOString().slice(0,10) }));
      setAddMiles(false);
      setMilesProgram('');
      setMilesQty('');
      setMilesWhen(dayjs().add(30, 'day').format('YYYY-MM-DD'));
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
    // Normaliza ausência de categoria para null
    if (!id || id === 'SemCategoria') {
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
    // Token 'all' representa ausência de fonte selecionada
    const id = s.id === 'all' ? null : s.id;
    let label: string | null = null;
    if (s.kind === 'account' && id) label = findAccount(id)?.name || null;
    if (s.kind === 'card' && id) label = cardsById.get(id)?.name || null;
    setForm(prev => ({ ...prev, source_kind: s.kind, source_id: id, source_label: label }));
  }, [cardsById, findAccount]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if(!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{initialData ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[80vh] sm:max-h-[70vh] p-4">
          <div className="grid gap-4">
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
            <span className="text-xs text-text/70">Sempre informe valor positivo — o tipo abaixo define se é receita ou despesa.</span>
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
                // Nunca passe string vazia para value
                value={form.category_id ?? undefined}
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
                // Use token 'all' para representar ausência de seleção
                value={{ kind: form.source_kind ?? 'account', id: form.source_id ?? 'all' }}
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

          {/* Anexo (nota/recibo) */}
          <div className="grid gap-1">
            <Label>Anexo (nota/recibo — PDF/Imagem)</Label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => handleChange('attachment_file', e.target.files?.[0] || null)}
            />
            <span className="text-xs text-text/70">(Opcional; upload/extração OCR entram no próximo passo.)</span>
          </div>

          {/* Milhas */}
          <div className="rounded-md border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Acumula milhas?</Label>
              <Switch checked={addMiles} onCheckedChange={setAddMiles} />
            </div>
            {addMiles && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="grid gap-1">
                  <Label>Programa</Label>
                  <Select value={milesProgram} onValueChange={(v) => setMilesProgram(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="livelo">Livelo</SelectItem>
                      <SelectItem value="latampass">LATAM Pass</SelectItem>
                      <SelectItem value="azul">Azul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min={0}
                    value={milesQty as any}
                    onChange={(e) => setMilesQty(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Disponível em</Label>
                  <Input type="date" value={milesWhen} onChange={(e) => setMilesWhen(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-background/80 backdrop-blur border-t p-4">
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
              <div className="text-xs text-muted">
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