import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

// \-\-\- Types -----------------------------------------------------------------
export type BaseData = {
  date: string;            // YYYY-MM-DD
  description: string;
  value: number;           // sempre positivo; tipo define sinal
  type: 'income' | 'expense';
  category: string;        // (por enquanto texto; depois trocamos por category_id)
  payment_method?: string; // Pix/Cartão/Dinheiro/Boleto/Transferência/Outro
  // Extensões (opcionais, para o futuro sem quebrar quem usa hoje)
  source_kind?: 'account' | 'card';
  source_label?: string | null;  // nome da conta/cartão (placeholder até ligarmos ao banco)
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

const CATEGORIAS = ['Alimentação','Transporte','Moradia','Educação','Saúde','Lazer','Salário','Freelance','Investimentos','Outros'];
const METODOS = ['Pix','Cartão','Dinheiro','Boleto','Transferência','Outro'];

export function ModalTransacao({ open, onClose, initialData, onSubmit }: Props) {
  const [form, setForm] = useState<BaseData>({
    date: new Date().toISOString().slice(0,10),
    description: '',
    value: 0,
    type: 'expense',
    category: 'Outros',
    payment_method: 'Outro',
    source_kind: 'account',
    source_label: null,
    installments: null,
    notes: null,
    attachment_file: null,
  });
  const [loading, setLoading] = useState(false);

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

  const handleChange = (key: keyof BaseData, v: any) => setForm(prev => ({ ...prev, [key]: v }));

  const handleSubmit = async () => {
    if (!form.description || !form.date || !form.category || !form.type) return;
    const n = Number(form.value);
    if (Number.isNaN(n) || n <= 0) return;

    setLoading(true);
    try {
      // envia apenas dados serializáveis; arquivo será tratado fora (futuro)
      const payload: BaseData = {
        ...form,
        value: n,
      };
      await onSubmit(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const showInstallments = form.type === 'expense' && (form.payment_method || '').toLowerCase().startsWith('cart');

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
          </div>

          <div className="grid gap-1">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex.: Mercado, Salário..."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid gap-1">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={form.value}
              onChange={(e) => handleChange('value', Number(e.target.value))}
            />
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
              <Select value={form.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
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
              <div className="inline-flex overflow-hidden rounded-xl border border-white/30">
                <button
                  type="button"
                  className={`px-3 py-2 text-sm ${form.source_kind === 'account' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-200'}`}
                  onClick={() => handleChange('source_kind', 'account')}
                >Conta</button>
                <button
                  type="button"
                  className={`px-3 py-2 text-sm ${form.source_kind === 'card' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-200'}`}
                  onClick={() => handleChange('source_kind', 'card')}
                >Cartão</button>
              </div>
            </div>
          </div>

          <div className="grid gap-1">
            <Label>{form.source_kind === 'card' ? 'Cartão (nome/identificação)' : 'Conta (nome/identificação)'}</Label>
            <Input
              placeholder={form.source_kind === 'card' ? 'Ex.: Nubank Visa final 1234' : 'Ex.: Itaú Conta Corrente'}
              value={form.source_label || ''}
              onChange={(e) => handleChange('source_label', e.target.value)}
            />
            <span className="text-xs text-slate-500">(Rascunho temporário — depois ligaremos à lista real de contas/cartões.)</span>
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
            <span className="text-xs text-slate-500">(Opcional; upload/extração OCR entram no próximo passo.)</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}