import { useMemo, useState } from 'react';
import type { Transaction } from '@/hooks/useTransactions';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import dayjs from 'dayjs';

type Props = {
  transacoes: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => Promise<void>;
};

type SortKey = 'date' | 'description' | 'category' | 'value';
type SortDir = 'asc' | 'desc';

export default function TransactionsTable({ transacoes, onEdit, onDelete }: Props) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return transacoes;
    return transacoes.filter(t =>
      t.description.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term) ||
      dayjs(t.date).format('DD/MM/YYYY').includes(term)
    );
  }, [q, transacoes]);

  const ordered = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let vA: string | number = '';
      let vB: string | number = '';
      if (sortKey === 'value') { vA = a.value; vB = b.value; }
      else if (sortKey === 'date') { vA = +new Date(a.date); vB = +new Date(b.date); }
      else { vA = (a as any)[sortKey]?.toString().toLowerCase(); vB = (b as any)[sortKey]?.toString().toLowerCase(); }
      const res = vA < vB ? -1 : vA > vB ? 1 : 0;
      return sortDir === 'asc' ? res : -res;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(ordered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * pageSize;
  const rows = ordered.slice(start, start + pageSize);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Input
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          placeholder="Buscar por descrição, categoria ou data…"
          className="w-full sm:max-w-xs bg-white dark:bg-slate-800"
        />
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
          <span>
            {ordered.length} {ordered.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border bg-white dark:bg-slate-900 overflow-hidden">
        <Table aria-label="Tabela de transações" tabIndex={0}>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-slate-800">
              <Th onClick={() => toggleSort('date')} label="Data" active={sortKey==='date'} dir={sortDir} />
              <Th onClick={() => toggleSort('description')} label="Descrição" active={sortKey==='description'} dir={sortDir} />
              <Th onClick={() => toggleSort('category')} label="Categoria" active={sortKey==='category'} dir={sortDir} />
              <Th onClick={() => toggleSort('value')} label="Valor (R$)" active={sortKey==='value'} dir={sortDir} right />
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => {
              const valorReal = t.type === 'expense' ? -t.value : t.value;
              const negativo = valorReal < 0;
              return (
                <TableRow key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                  <TableCell>{dayjs(t.date).format('DD/MM/YYYY')}</TableCell>
                  <TableCell className="max-w-[360px] truncate">{t.description}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell className={`text-right font-numeric ${negativo ? 'text-red-600' : 'text-green-600'}`}>
                    {valorReal.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onEdit(t)}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(t.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
    </div>
  );
}

/* Cabeçalho clicável para ordenar */
function Th({
  label, onClick, active, dir, right
}: { label: string; onClick: () => void; active: boolean; dir: 'asc'|'desc'; right?: boolean }) {
  return (
    <TableHead aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        onClick={onClick}
        className={`group inline-flex items-center gap-1 ${right ? 'float-right' : ''}`}
        title="Ordenar"
        aria-label={`Ordenar por ${label}`}
      >
        <span className="font-medium">{label}</span>
        <ArrowUpDown
          size={14}
          className={`opacity-60 group-hover:opacity-100 ${active ? 'text-slate-900 dark:text-slate-100' : ''}`}
        />
        {active && <span className="sr-only">{dir === 'asc' ? '(asc)' : '(desc)'}</span>}
      </button>
    </TableHead>
  );
}