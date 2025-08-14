import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CreditCard,
  Upload,
  Download,
  Copy,
  CheckSquare,
  Square,
  Plus,
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";

import { Wallet } from "@/components/icons";
import { exportTransactionsPDF } from "@/utils/pdf";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import type { Account } from '@/hooks/useAccounts';
import type { CreditCard as CardModel } from '@/hooks/useCreditCards';
import { Badge } from '@/components/ui/badge';

// Tipo de linha exibida na tabela (shape de UI vindo de FinancasMensal)
type SourceRef =
  | { kind: 'account'; id: string; entity?: Account }
  | { kind: 'card'; id: string; entity?: CardModel };

export type UITransaction = {
  id: number;
  date: string; // YYYY-MM-DD
  description: string;
  value: number; // positivo
  type: 'income' | 'expense';
  category?: string | null;
  category_id?: string | null;
  source?: SourceRef | null;
  source_kind?: 'account' | 'card' | null;
  source_id?: string | null;
  account_id?: string | null;
  card_id?: string | null;
  installment_no?: number | null;
  installment_total?: number | null;
  // campos alternativos que podem aparecer em alguns fluxos (mantidos como opcionais)
  payment_method?: string | null;
  source_type?: string | null;
  source_name?: string | null;
  account_name?: string | null;
  card_name?: string | null;
  installment_number?: number | null;
  installments_total?: number | null;
  origin?: {
    wishlist_item_id?: number | null;
  } | null;
};

// util de moeda BRL
const brl = (n: number) => (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Props da tabela (somente UI).
 */
 type Props = {
  transacoes: UITransaction[];
  onEdit: (t: UITransaction) => void;
  onDelete: (id: number) => Promise<void>;
  onDeleteMany?: (ids: number[]) => Promise<void>;
  /** Duplicar selecionadas para um mês (ex.: '2025-08'). Se não vier, o botão some. */
  onDuplicateMany?: (ids: number[], targetYYYYMM: string) => Promise<void>;
  /** Importar CSV (texto). Se não vier, o botão some. */
  onImportCSV?: (csvText: string) => Promise<void>;
  /** Exportar selecionadas (ids). Se não vier, usamos fallback interno que baixa PDF. */
  onExportSelected?: (ids: number[]) => void;
  /** Notifica a seleção externa (opcional) */
  onSelectionChange?: (ids: number[]) => void;
  /** Abrir modal de nova transação (opcional) */
  onNew?: () => void;
};

 type SortKey = 'date' | 'description' | 'category' | 'value';
 type SortDir = 'asc' | 'desc';

export default function TransactionsTable({
  transacoes,
  onEdit,
  onDelete,
  onDeleteMany,
  onDuplicateMany,
  onImportCSV,
  onExportSelected,
  onNew,
  onSelectionChange,
}: Props) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dupOpen, setDupOpen] = useState(false);
  const [mesDestino, setMesDestino] = useState(() => dayjs().format('YYYY-MM'));

  const { data: accounts } = useAccounts();
  const accountsById = useMemo(() => new Map(accounts.map(a => [a.id, a])), [accounts]);
  const { data: cards } = useCreditCards();
  const cardsById = useMemo(() => new Map(cards.map(c => [c.id, c])), [cards]);

  useEffect(() => {
    onSelectionChange?.(Array.from(selected));
  }, [selected, onSelectionChange]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  // busca simples por descrição/categoria/data
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return transacoes;
    return transacoes.filter(t =>
      (t.description || '').toLowerCase().includes(term) ||
      (t.category || '').toLowerCase().includes(term) ||
      dayjs(t.date).format('DD/MM/YYYY').includes(term)
    );
  }, [q, transacoes]);

  // ordenação
  const ordered = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let vA: string | number = '';
      let vB: string | number = '';
      if (sortKey === 'value') {
        vA = a.value;
        vB = b.value;
      } else if (sortKey === 'date') {
        vA = +new Date(a.date);
        vB = +new Date(b.date);
      } else if (sortKey === 'description') {
        vA = (a.description || '').toLowerCase();
        vB = (b.description || '').toLowerCase();
      } else if (sortKey === 'category') {
        vA = (a.category || '').toLowerCase();
        vB = (b.category || '').toLowerCase();
      }
      const res = vA < vB ? -1 : vA > vB ? 1 : 0;
      return sortDir === 'asc' ? res : -res;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // totais (filtro) para footer
  const totalsAll = useMemo(() => {
    const inc = ordered.filter(t => t.type === 'income').reduce((s, t) => s + (t.value || 0), 0);
    const exp = ordered.filter(t => t.type === 'expense').reduce((s, t) => s + (t.value || 0), 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [ordered]);

  const totalPages = Math.max(1, Math.ceil(ordered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * pageSize;
  const rows = ordered.slice(start, start + pageSize);

  const totalsPage = useMemo(() => {
    const inc = rows.filter(t => t.type === 'income').reduce((s, t) => s + (t.value || 0), 0);
    const exp = rows.filter(t => t.type === 'expense').reduce((s, t) => s + (t.value || 0), 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [rows]);

  // seleção
  const toggleRow = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const allIdsOnPage = rows.map(r => r.id).filter(Boolean);
  const allSelectedOnPage = allIdsOnPage.length > 0 && allIdsOnPage.every(id => selected.has(id));
  const toggleAllPage = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelectedOnPage) {
        allIdsOnPage.forEach(id => next.delete(id));
      } else {
        allIdsOnPage.forEach(id => next.add(id));
      }
      return next;
    });
  };
  const selectAllFiltered = () => setSelected(new Set(ordered.map(r => r.id).filter(Boolean)));
  const clearSelection = () => setSelected(new Set());

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const ok = confirm(`Excluir ${ids.length} lançamento(s) selecionado(s)?`);
    if (!ok) return;
    if (onDeleteMany) await onDeleteMany(ids);
    else await Promise.all(ids.map(id => onDelete(id)));
    setSelected(new Set());
    toast.success('Excluídos com sucesso');
  };

  // ======= Import / Export / Duplicar =======
  const exportSelected = () => {
    const ids = Array.from(selected);
    if (!ids.length) {
      toast.info("Selecione algo para exportar.");
      return;
    }
    if (onExportSelected) {
      onExportSelected(ids);
      return;
    }
    const rows = ordered.filter((r) => ids.includes(r.id));
    if (!rows.length) {
      toast.info("Nada para exportar.");
      return;
    }
    const currentPeriod = dayjs().format('YYYY-MM');
    exportTransactionsPDF(rows, {}, currentPeriod);
  };

  const onClickImport = () => fileRef.current?.click();
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const txt = await file.text();
    try {
      if (!onImportCSV) { toast.info('Import não está habilitado nesta tabela.'); return; }
      await onImportCSV(txt);
      toast.success('Importado com sucesso!');
    } catch (err: unknown) {
      const e = err as Error;
      console.error(e); toast.error(e.message || 'Falha ao importar CSV');
    } finally {
      e.target.value = '';
    }
  };

  const handleDuplicateOpen = () => {
    if (!onDuplicateMany) { toast.info('Duplicar não está habilitado aqui.'); return; }
    if (selected.size === 0) { toast.info('Selecione ao menos 1 linha.'); return; }
    setDupOpen(true);
  };

  const handleDuplicateConfirm = async () => {
    if (!onDuplicateMany) return;
    const ids = Array.from(selected);
    try {
      await onDuplicateMany(ids, mesDestino);
      toast.success('Duplicado com sucesso!');
      setDupOpen(false);
    } catch (err: unknown) {
      const e = err as Error;
      console.error(e); toast.error(e.message || 'Falha ao duplicar');
    }
  };

  return (
    <TooltipProvider delayDuration={200} disableHoverableContent>
      <div className="space-y-3">
      {/* Toolbar premium */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-zinc-900/50 backdrop-blur p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Input
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="Buscar por descrição, categoria ou data…"
            className="w-full sm:max-w-xs rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10"
          />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
            <span className="text-slate-500 dark:text-slate-300">
              {ordered.length} {ordered.length === 1 ? 'registro' : 'registros'}
            </span>
            <div className="h-4 w-px bg-slate-300/60 dark:bg-white/10" />
            <Button variant="outline" size="sm" onClick={selectAllFiltered} className="inline-flex items-center gap-2">
              <CheckSquare className="h-4 w-4"/> Selecionar tudo
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection} className="inline-flex items-center gap-2">
              <Square className="h-4 w-4"/> Limpar
            </Button>
            <div className="h-4 w-px bg-slate-300/60 dark:bg-white/10" />
            {onImportCSV && (
              <>
                <input ref={fileRef} type="file" accept="text/csv" className="hidden" onChange={onFileChange} />
                <Button variant="outline" size="sm" onClick={onClickImport} className="inline-flex items-center gap-2">
                  <Upload className="h-4 w-4"/> Importar CSV
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={exportSelected} disabled={selected.size === 0} className="inline-flex items-center gap-2">
              <Download className="h-4 w-4"/> Exportar PDF
            </Button>
            {onDuplicateMany && (
              <Button variant="outline" size="sm" onClick={handleDuplicateOpen} disabled={selected.size === 0} className="inline-flex items-center gap-2">
                <Copy className="h-4 w-4"/> Duplicar p/ mês
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={selected.size === 0}>
              <Trash2 className="h-4 w-4"/> Excluir selecionadas
            </Button>
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-300">
          {selected.size > 0 ? `${selected.size} selecionada(s)` : 'Nenhuma seleção'}
        </div>
      </div>

      {/* Tabela com header fixo e rolagem */}
      <div className="rounded-xl border bg-white/70 dark:bg-slate-900/60 backdrop-blur overflow-hidden">
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/70 dark:bg-slate-800/70 sticky top-0 z-10">
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Selecionar página"
                    className="h-4 w-4 accent-emerald-600"
                    checked={allSelectedOnPage}
                    onChange={toggleAllPage}
                  />
                </TableHead>
                <Th onClick={() => toggleSort('date')} label="Data" active={sortKey==='date'} dir={sortDir} />
                <Th onClick={() => toggleSort('description')} label="Descrição" active={sortKey==='description'} dir={sortDir} />
                <Th onClick={() => toggleSort('category')} label="Categoria" active={sortKey==='category'} dir={sortDir} />
                <TableHead>Fonte</TableHead>
                <TableHead>Parcela</TableHead>
                <Th onClick={() => toggleSort('value')} label="Valor" active={sortKey==='value'} dir={sortDir} right />
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => {
                const isExpense = t.type === 'expense';
                const valorReal = isExpense ? -Math.abs(t.value) : Math.abs(t.value);
                const negativo = valorReal < 0;
                const resolveSource = (): SourceRef | null => {
                  if (t.source) return t.source;
                  if (t.source_kind && t.source_id) {
                    return { kind: t.source_kind as 'account' | 'card', id: t.source_id };
                  }
                  if (t.account_id) return { kind: 'account', id: t.account_id };
                  if (t.card_id) return { kind: 'card', id: t.card_id };
                  return null;
                };
                const ref = resolveSource();
                const n = Number(t.installment_no ?? t.installment_number ?? 1);
                const N = Number(t.installment_total ?? t.installments_total ?? 1);
                return (
                  <TableRow key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-emerald-600"
                        checked={selected.has(t.id)}
                        onChange={() => toggleRow(t.id)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{dayjs(t.date).format('DD/MM/YYYY')}</TableCell>
                    <TableCell className="max-w-[360px]">
                      <div className="flex items-center gap-2">
                        <span className="truncate" title={t.description}>{t.description}</span>
                        {t.origin?.wishlist_item_id && (
                          <Badge variant="outline">Origem: Desejo</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{t.category ?? '—'}</TableCell>
                    <TableCell>
                      {(() => {
                        if (ref?.kind === 'account') {
                          const acc = accountsById.get(ref.id);
                          const name = acc?.name || t.account_name || t.source_name || 'Conta';
                          const short = name.length > 12 ? name.slice(0, 12) + '…' : name;
                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="gap-1">
                                  <Wallet size={12} />
                                  <span className="max-w-[80px] truncate">{short}</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>{name}</TooltipContent>
                            </Tooltip>
                          );
                        }
                        if (ref?.kind === 'card') {
                          const card = cardsById.get(ref.id);
                          const name = card?.name || t.card_name || t.source_name || 'Cartão';
                          const short = name.length > 12 ? name.slice(0, 12) + '…' : name;
                          const brand = card?.brand || card?.bank;
                          return (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="secondary" className="gap-1">
                                  <CreditCard size={12} />
                                  <span className="max-w-[80px] truncate">{short}</span>
                                  {brand && <span className="text-[10px] uppercase opacity-70">{brand}</span>}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>{name}</TooltipContent>
                            </Tooltip>
                          );
                        }
                        const nome = t.source_name || '—';
                        const short = nome.length > 12 ? nome.slice(0, 12) + '…' : nome;
                        const isCard = (t.source_kind || t.source_type || '').toLowerCase().includes('card') || !!t.card_id;
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="gap-1">
                                {isCard ? <CreditCard size={12} /> : <Wallet size={12} />}
                                <span className="max-w-[80px] truncate">{short}</span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{nome}</TooltipContent>
                          </Tooltip>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="tabular-nums text-slate-600 dark:text-slate-300">
                      {N > 1 ? `${n}/${N}` : '—'}
                    </TableCell>
                    <TableCell className={`text-right font-numeric tabular-nums ${negativo ? 'text-red-600' : 'text-emerald-600'}`}>
                      {brl(Math.abs(valorReal))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" onClick={() => onEdit(t)} aria-label="Editar">
                              <Pencil size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => onDelete(t.id)} aria-label="Excluir">
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Excluir</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-300">
                      <div className="text-sm">Nenhum registro encontrado.</div>
                      <div className="text-xs">Ajuste os filtros ou cadastre um novo lançamento.</div>
                      <div className="mt-2">
                        <Button onClick={() => (onNew ? onNew() : toast.info('Use o botão “Nova transação” acima.'))} className="inline-flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Nova transação
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {rows.length > 0 && (
                <TableRow className="bg-slate-50/60 dark:bg-slate-800/40 font-medium">
                  <TableCell colSpan={5}></TableCell>
                  <TableCell className="text-right">Página:</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="text-emerald-700 dark:text-emerald-400 mr-4">{brl(totalsPage.income)}</span>
                    <span className="text-rose-600 dark:text-rose-400 mr-4">{brl(totalsPage.expense)}</span>
                    <span className={`${totalsPage.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{brl(totalsPage.balance)}</span>
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-300">
          Página {pageSafe} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pageSafe <= 1}>
            <ChevronLeft size={16} /> Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={pageSafe >= totalPages}>
            Próxima <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Totais do filtro (fora da rolagem) */}
      {ordered.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium">Totais (filtro):</span>
          <span className="text-emerald-700 dark:text-emerald-400">Entradas {brl(totalsAll.income)}</span>
          <span className="text-rose-600 dark:text-rose-400">Saídas {brl(totalsAll.expense)}</span>
          <span className={`${totalsAll.balance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>Saldo {brl(totalsAll.balance)}</span>
        </div>
      )}

      {/* Dialog Duplicar p/ mês (se habilitado) */}
      <Dialog open={dupOpen} onOpenChange={setDupOpen}>
        <DialogContent className="sm:max-w-md bg-white/80 dark:bg-zinc-950/80 backdrop-blur rounded-2xl border border-white/30 dark:border-white/10 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Duplicar selecionadas</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {selected.size} item(ns) serão copiados para o mês selecionado.
            </div>
            <div>
              <span className="mb-1 block text-xs text-emerald-900/70 dark:text-emerald-100/80">Mês destino</span>
              <Input
                type="month"
                value={mesDestino}
                onChange={(e) => setMesDestino(e.target.value)}
                className="rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDupOpen(false)}>Cancelar</Button>
            <Button onClick={handleDuplicateConfirm} disabled={!onDuplicateMany || selected.size === 0}>Duplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
}

/* Cabeçalho clicável para ordenar */
function Th({
  label, onClick, active, dir, right
}: { label: string; onClick: () => void; active: boolean; dir: 'asc'|'desc'; right?: boolean }) {
  return (
    <TableHead>
      <button
        onClick={onClick}
        className={`group inline-flex items-center gap-1 ${right ? 'float-right' : ''}`}
        title="Ordenar"
      >
        <span className="font-medium">{label}</span>
        <ArrowUpDown size={14} className={`opacity-60 group-hover:opacity-100 ${active ? 'text-slate-900 dark:text-slate-100' : ''}`} />
        {active && <span className="sr-only">{dir === 'asc' ? '(asc)' : '(desc)'}</span>}
      </button>
    </TableHead>
  );
}