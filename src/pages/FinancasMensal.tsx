// src/pages/FinancasMensal.tsx
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

import { useTransactions, type Transaction, type TransactionInput } from '@/hooks/useTransactions';
import { ModalTransacao, type BaseData } from '@/components/ModalTransacao';

import PageHeader from '@/components/PageHeader';
import { MotionCard } from '@/components/ui/MotionCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Coins, TrendingUp, TrendingDown, Clock, Search, Plus, Download, CalendarRange, Copy } from 'lucide-react';
import { toast } from 'sonner';
import TransactionsTable, { type UITransaction } from '@/components/TransactionsTable';

import DailyBars from '@/components/charts/DailyBars';
import CategoryDonut from '@/components/charts/CategoryDonut';

// shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

import { useCategories } from '@/hooks/useCategories';
import SourcePicker, { type SourceValue } from '@/components/SourcePicker';

dayjs.locale('pt-br');

// utils simples p/ busca sem acento
const norm = (s: string) =>
  (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// força qualquer valor a número válido
const safe = (n: unknown) => Number(n) || 0;

// CSV helper local (exporta apenas filtradas)
function toCSV(rows: UITransaction[]) {
  const header = [
    'id',
    'date',
    'description',
    'value',
    'type',
    'category',
    'source_kind',
    'source_id',
    'installment_no',
    'installment_total',
  ].join(',');
  const lines = rows.map((r) =>
    [
      r.id,
      r.date,
      JSON.stringify(r.description ?? ''),
      r.value,
      r.type,
      JSON.stringify(r.category ?? ''),
      r.source_kind ?? '',
      JSON.stringify(r.source_id ?? ''),
      r.installment_no ?? '',
      r.installment_total ?? '',
    ].join(',')
  );
  return [header, ...lines].join('\n');
}

export default function FinancasMensal() {
  // ===== filtros locais sincronizados com URL =====
  const [searchParams, setSearchParams] = useSearchParams();
  const now = dayjs();
  const currentMes = now.format('YYYY-MM');
  const initMesParam = searchParams.get('mes');
  const initAnoParam = searchParams.get('ano');
  const initialMes =
    initMesParam ?? (initAnoParam ? `${initAnoParam}-${currentMes.slice(5, 7)}` : currentMes);
  const initialCategoria = searchParams.get('cat');
  const initialBusca = searchParams.get('q') ?? '';
  const initialFonte: SourceValue = (() => {
    const f = searchParams.get('fonte');
    if (f) {
      const [kind, id] = f.split(':');
      if ((kind === 'account' || kind === 'card') && id) {
        return { kind, id } as SourceValue;
      }
    }
    return { kind: 'account', id: null };
  })();

  const [mesAtual, setMesAtual] = useState(initialMes);
  const [categoriaId, setCategoriaId] = useState<'Todas' | string>(initialCategoria ?? 'Todas');
  const [fonte, setFonte] = useState<SourceValue>(initialFonte);
  const [busca, setBusca] = useState(initialBusca);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('mes', mesAtual);
    params.set('ano', mesAtual.slice(0, 4));
    if (categoriaId && categoriaId !== 'Todas') params.set('cat', categoriaId);
    else params.delete('cat');
    if (fonte.id) params.set('fonte', `${fonte.kind}:${fonte.id}`);
    else params.delete('fonte');
    if (busca) params.set('q', busca);
    else params.delete('q');
    setSearchParams(params, { replace: true });
  }, [mesAtual, categoriaId, fonte, busca, setSearchParams, searchParams]);

  const limparFiltros = () => {
    setCategoriaId('Todas');
    setFonte({ kind: 'account', id: null });
    setBusca('');
  };

  // ===== modal (criar/editar) =====
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Transaction | null>(null);

  // ===== dialog duplicar =====
  const [dupOpen, setDupOpen] = useState(false);
  const [mesDestino, setMesDestino] = useState(() => dayjs().format('YYYY-MM'));

  // ===== derivar período para hook =====
  const year = Number(mesAtual.slice(0, 4));
  const month = Number(mesAtual.slice(5, 7));

  // ===== dados via hook Supabase =====
  // (esta versão assume que useTransactions já possui duplicateMany e list)
  const { data, loading, error, addSmart, update, remove, duplicateMany, list } =
    useTransactions(year, month);

  // ===== categorias (mapear id -> nome) =====
  const { flat: categorias, byId: categoriasById } = useCategories();

  type CategoriaOption = { id: string; name: string };
  const categoriasOptions: CategoriaOption[] = useMemo(() => {
    const base = categorias.map((c) => ({ id: c.id, name: c.name }));
    return [{ id: 'Todas', name: 'Todas' }, ...base];
  }, [categorias]);

  // ===== converter para UI (type/value) =====
  const uiTransacoes: UITransaction[] = useMemo(() => {
    return data.map((t) => {
      const type = t.amount >= 0 ? 'income' : 'expense';
      const value = Math.abs(t.amount);
      const category = t.category_id ? categoriasById.get(t.category_id)?.name ?? null : null;
      const source_kind: 'account' | 'card' | null = t.card_id
        ? 'card'
        : t.account_id
        ? 'account'
        : null;
      const source_id = t.card_id ?? t.account_id ?? null;
      return {
        id: t.id,
        date: t.date,
        description: t.description,
        value,
        type,
        category,
        category_id: t.category_id ?? null,
        source_kind,
        source_id,
        installment_no: t.installment_no ?? null,
        installment_total: t.installment_total ?? null,
      };
    });
  }, [data, categoriasById]);

  const transacoesFiltradas = useMemo(() => {
    let out = uiTransacoes;
    if (categoriaId !== 'Todas') out = out.filter((t) => t.category_id === categoriaId);
    if (fonte.id) {
      out = out.filter((t) => t.source_kind === fonte.kind && t.source_id === fonte.id);
    }
    if (busca) {
      const q = norm(busca);
      out = out.filter((t) => norm(t.description).includes(q));
    }
    return out;
  }, [uiTransacoes, categoriaId, fonte, busca]);

  // KPIs (filtradas) — garantir números válidos
  const entradas = useMemo(
    () =>
      transacoesFiltradas
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + safe(t.value), 0),
    [transacoesFiltradas]
  );
  const saidasAbs = useMemo(
    () =>
      transacoesFiltradas
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + safe(t.value), 0),
    [transacoesFiltradas]
  );
  const saldo = useMemo(() => entradas - saidasAbs, [entradas, saidasAbs]);

  const aPagarHoje = useMemo(() => {
    const hoje = dayjs().format('YYYY-MM-DD');
    return transacoesFiltradas
      .filter((t) => t.type === 'expense' && t.date === hoje)
      .reduce((s, t) => s + safe(t.value), 0);
  }, [transacoesFiltradas]);

  // ===== Handlers modal =====
  const abrirNovo = () => {
    setEditando(null);
    setModalAberto(true);
  };

  const salvar = async (dataForm: BaseData) => {
    try {
      if (editando) {
        const amount =
          dataForm.type === 'expense' ? -Math.abs(dataForm.value) : Math.abs(dataForm.value);
        await update(editando.id, {
          date: dataForm.date,
          description: dataForm.description,
          amount,
          category_id: dataForm.category_id ?? null,
          account_id: dataForm.source_kind === 'account' ? dataForm.source_id ?? null : null,
          card_id: dataForm.source_kind === 'card' ? dataForm.source_id ?? null : null,
        } as Partial<Transaction>);
        toast.success('Transação atualizada!');
      } else {
        await addSmart(dataForm as unknown as TransactionInput);
        toast.success('Transação adicionada!');
      }
      setModalAberto(false);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Erro ao salvar';
      toast.error(message);
    }
  };

  const excluir = async (id: number) => {
    try {
      await remove(id);
      toast.success('Transação excluída!');
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Erro ao excluir';
      toast.error(message);
    }
  };

  // Atalho de teclado: "N" abre nova transação
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        !modalAberto &&
        e.key?.toLowerCase() === 'n' &&
        !(e.target as HTMLElement)?.closest('input, textarea, [contenteditable="true"], select')
      ) {
        e.preventDefault();
        abrirNovo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalAberto]);

  // ======= Action Bar (Export / Duplicar) =======
  const idsFiltradas = useMemo(() => transacoesFiltradas.map((t) => t.id), [transacoesFiltradas]);
  const [idsSelecionadas, setIdsSelecionadas] = useState<number[]>([]);
  const idsParaDuplicar = idsSelecionadas.length ? idsSelecionadas : idsFiltradas;

  const handleExport = () => {
    if (!transacoesFiltradas.length) {
      toast.info('Nada para exportar');
      return;
    }
    const csv = toCSV(transacoesFiltradas);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financas-${mesAtual}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const abrirDuplicar = () => {
    if (!idsParaDuplicar.length) {
      toast.info('Nada para duplicar');
      return;
    }
    setDupOpen(true);
  };

  const confirmarDuplicar = async () => {
    const [anoStr, mesStr] = mesDestino.split('-');
    const targetAno = Number(anoStr);
    const targetMes = Number(mesStr);
    if (!targetAno || !targetMes || targetMes < 1 || targetMes > 12 || targetAno < 1970 || targetAno > 9999) {
      toast.error('Mês destino inválido');
      return;
    }
    if (!idsParaDuplicar.length) {
      toast.info('Nada para duplicar');
      return;
    }
    try {
      await duplicateMany(idsParaDuplicar, targetAno, targetMes);
      toast.success('Duplicado com sucesso!');
      setDupOpen(false);
      if (targetAno === year && targetMes === month) await list();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Falha ao duplicar';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader title="Finanças — Mensal" subtitle="Cadastre e acompanhe lançamentos do mês">
        {/* Filtros dentro do header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          {/* Mês (YYYY-MM) */}
          <div>
            <span className="mb-1 block text-xs text-emerald-100/90">Mês</span>
            <Select value={mesAtual} onValueChange={setMesAtual}>
              <SelectTrigger className="w-full h-10 rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Array.from({ length: 18 }).map((_, i) => {
                  const d = dayjs().subtract(i, 'month');
                  const v = d.format('YYYY-MM');
                  return (
                    <SelectItem key={v} value={v}>
                      {d.format('MMMM/YYYY')}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div>
            <span className="mb-1 block text-xs text-emerald-100/90">Categoria</span>
            <Select value={categoriaId} onValueChange={(v) => setCategoriaId(v as string | 'Todas')}>
              <SelectTrigger className="w-full h-10 rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-72">
                {categoriasOptions.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fonte */}
          <div>
            <span className="mb-1 block text-xs text-emerald-100/90">Fonte</span>
            <SourcePicker
              value={fonte}
              onChange={setFonte}
              placeholder="Todas"
              className="w-full"
              showCardHints={false}
            />
          </div>

          {/* Busca */}
          <div className="sm:col-span-2">
            <span className="mb-1 block text-xs text-emerald-100/90">Buscar</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-200/70" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Descrição, loja, observações…"
                className="w-full h-10 pl-9 rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <Button variant="outline" onClick={limparFiltros} className="w-full">
              Limpar filtros
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* ======= ACTION BAR ======= */}
      <section className="card-surface p-3 sm:p-4 flex flex-wrap items-center gap-2 sm:gap-3 justify-between">
        <div className="text-xs sm:text-sm text-emerald-900/80 dark:text-emerald-100/80">
          {transacoesFiltradas.length} lançamentos filtrados
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button onClick={abrirNovo} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nova transação
          </Button>
          <Button variant="outline" onClick={handleExport} className="inline-flex items-center gap-2">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button variant="outline" onClick={abrirDuplicar} className="inline-flex items-center gap-2">
            <Copy className="h-4 w-4" /> Duplicar
          </Button>
        </div>
      </section>

      {/* KPIs */}
      <TooltipProvider delayDuration={200}>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <MotionCard>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-600 text-white">
                    <Coins size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 dark:text-slate-300 text-sm">Saldo do mês</span>
                    <AnimatedNumber value={saldo} />
                  </div>
                </div>
              </MotionCard>
            </TooltipTrigger>
            <TooltipContent>Saldo = Entradas - Saídas</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <MotionCard>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-600 text-white">
                    <TrendingUp size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500 dark:text-slate-300">Entradas</span>
                    <AnimatedNumber value={entradas} />
                  </div>
                </div>
              </MotionCard>
            </TooltipTrigger>
            <TooltipContent>Entradas = soma das receitas</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <MotionCard>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-rose-500 text-white">
                    <TrendingDown size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500 dark:text-slate-300">Saídas</span>
                    <AnimatedNumber value={saidasAbs} />
                  </div>
                </div>
              </MotionCard>
            </TooltipTrigger>
            <TooltipContent>Saídas = soma das despesas</TooltipContent>
          </Tooltip>

          <MotionCard>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500 text-white">
                <Clock size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-slate-500 dark:text-slate-300">A pagar hoje</span>
                <AnimatedNumber value={aPagarHoje} />
              </div>
            </div>
          </MotionCard>
        </section>
      </TooltipProvider>

      {/* Gráficos */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyBars transacoes={transacoesFiltradas} mes={mesAtual} />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonut
            transacoes={transacoesFiltradas.filter(
              (t): t is UITransaction & { category: string } => !!t.category
            )}
          />
        </div>
      </section>

      {/* mensagens de estado */}
      {loading && <p>Carregando…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* TABELA */}
      <TransactionsTable
        transacoes={transacoesFiltradas}
        onEdit={(row) => {
          setEditando(data.find((d) => d.id === row.id) || null);
          setModalAberto(true);
        }}
        onDelete={(id: number) => excluir(id)}
        onSelectionChange={setIdsSelecionadas}
      />

      {/* botão flutuante (FAB) */}
      <TooltipProvider delayDuration={200} disableHoverableContent>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={abrirNovo}
              className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-full shadow-xl"
              aria-label="Nova transação"
              title="Nova transação"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Nova transação (atalho: N)</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* modal criar/editar */}
      <ModalTransacao
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        initialData={
          editando
            ? ({
                date: editando.date,
                description: editando.description,
                value: Math.abs(editando.amount),
                type: editando.amount >= 0 ? 'income' : 'expense',
                category: editando.category_id
                  ? categoriasById.get(editando.category_id)?.name ?? 'Outros'
                  : 'Outros',
                category_id: editando.category_id ?? null,
                source_kind: editando.card_id ? 'card' : editando.account_id ? 'account' : undefined,
                source_id: editando.card_id ?? editando.account_id ?? undefined,
                installments: editando.installment_total ?? undefined,
              } as BaseData)
            : undefined
        }
        onSubmit={salvar}
      />

      {/* Dialog Duplicar p/ mês */}
      <Dialog open={dupOpen} onOpenChange={setDupOpen}>
        <DialogContent className="sm:max-w-md bg-white/80 dark:bg-zinc-950/80 backdrop-blur rounded-2xl border border-white/30 dark:border-white/10 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Duplicar lançamentos</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {idsParaDuplicar.length} itens serão copiados para o mês selecionado.
            </div>
            <div>
              <span className="mb-1 block text-xs text-emerald-900/70 dark:text-emerald-100/80">
                Mês destino
              </span>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10">
                  <CalendarRange className="h-4 w-4 text-emerald-600" />
                </span>
                <Input
                  type="month"
                  value={mesDestino}
                  onChange={(e) => setMesDestino(e.target.value)}
                  className="rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDupOpen(false)}>
              Fechar
            </Button>
            <Button onClick={confirmarDuplicar}>Duplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}