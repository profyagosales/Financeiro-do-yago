import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

import { useTransactions } from '../hooks/useTransactions';
import type { Transaction } from '../hooks/useTransactions';
import { ModalTransacao } from '../components/ModalTransacao';
import { useAuth } from '../contexts/AuthContext';

import { PageHeader } from '@/components/PageHeader';
import { MotionCard } from '@/components/ui/MotionCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Coins, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { toast } from 'sonner';
import TransactionsTable from '@/components/TransactionsTable';
import { useUpcomingBills } from '@/hooks/useBills';

import DailyBars from '@/components/charts/DailyBars';
import CategoryDonut from '@/components/charts/CategoryDonut';

// shadcn/ui
import { Button } from '@/components/ui/button';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/components/ui/select';

dayjs.locale('pt-br');

export default function FinancasMensal() {
  /* filtros */
  const [mesAtual, setMesAtual] = useState(() => dayjs().format('YYYY-MM'));
  const [categoria, setCategoria] = useState('Todas');

  /* modal (criar/editar) */
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Transaction | null>(null);

  /* dados via hook Supabase */
  const {
    data: transacoes,
    loading,
    error,
    add,
    update,
    remove,
  } = useTransactions(mesAtual, categoria);

  /* sair */
  const { signOut } = useAuth();

  /* listas únicas para selects */
  const mesesUnicos = useMemo(() => {
    const set = new Set(transacoes.map(t => t.date.slice(0, 7)));
    set.add(mesAtual);
    return Array.from(set).sort().reverse();
  }, [transacoes, mesAtual]);

  const categoriasUnicas = useMemo(() => {
    const set = new Set(transacoes.map(t => t.category));
    set.add('Todas');
    return Array.from(set).sort();
  }, [transacoes]);

  /* KPIs */
  const receitas = useMemo(
    () => transacoes.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0),
    [transacoes]
  );
  const despesasBrutas = useMemo(
    () => transacoes.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0),
    [transacoes]
  );
  const total = useMemo(() => receitas - despesasBrutas, [receitas, despesasBrutas]);

  const aPagarHoje = useMemo(() => {
    const hoje = dayjs().format('YYYY-MM-DD');
    return transacoes
      .filter(t => t.type === 'expense' && t.date === hoje)
      .reduce((s, t) => s + t.value, 0);
  }, [transacoes]);

  const { data: contasAVencer, loading: loadingBills } = useUpcomingBills();

  /* handlers modal */
  const abrirNovo = () => { setEditando(null); setModalAberto(true); };
  const abrirEditar = (t: Transaction) => { setEditando(t); setModalAberto(true); };

  const salvar = async (data: Omit<Transaction, 'id' | 'user_id'>) => {
    try {
      if (editando) { await update(editando.id, data); toast.success('Transação atualizada!'); }
      else { await add(data); toast.success('Transação adicionada!'); }
      setModalAberto(false);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Erro ao salvar';
      toast.error(msg);
    }
  };

  const excluir = async (id: number) => {
    try {
      await remove(id);
      toast.success('Transação excluída!');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Erro ao excluir';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finanças Mensal"
        subtitle="Acompanhe resultados, categorias e vencimentos"
      >
        {/* Ações/filtros dentro do header */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px]">
            <span className="mb-1 block text-xs text-emerald-100/90">Mês</span>
            <Select value={mesAtual} onValueChange={setMesAtual}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {mesesUnicos.map((m) => (
                  <SelectItem key={m} value={m}>
                    {dayjs(m + '-01').format('MMMM/YYYY')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[220px]">
            <span className="mb-1 block text-xs text-emerald-100/90">Categoria</span>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                {categoriasUnicas.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="secondary" onClick={signOut}>
            Sair
          </Button>
        </div>
      </PageHeader>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-600 text-white"><Coins size={18} /></div>
            <div className="flex flex-col">
              <span className="text-slate-500 dark:text-slate-300 text-sm">Saldo atual</span>
              <AnimatedNumber value={total} />
            </div>
          </div>
        </MotionCard>

        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-600 text-white"><TrendingUp size={18} /></div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-300">Receitas</span>
              <AnimatedNumber value={receitas} />
            </div>
          </div>
        </MotionCard>

        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-rose-500 text-white"><TrendingDown size={18} /></div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-300">Despesas</span>
              <AnimatedNumber value={-despesasBrutas} />
            </div>
          </div>
        </MotionCard>

        <MotionCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500 text-white"><Clock size={18} /></div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 dark:text-slate-300">A pagar hoje</span>
              <AnimatedNumber value={-aPagarHoje} />
            </div>
          </div>
        </MotionCard>
      </section>

      {/* Gráficos */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyBars transacoes={transacoes} mes={mesAtual} />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonut transacoes={transacoes} />
        </div>
      </section>

      {/* Contas a vencer */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Contas a vencer</h2>
        {loadingBills ? (
          <p>Carregando...</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {contasAVencer.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2">
                <span>{c.description}</span>
                <span>{dayjs(c.due_date).format('DD/MM')} - {c.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </li>
            ))}
            {contasAVencer.length === 0 && (
              <li className="py-4 text-sm text-slate-500">Nenhuma conta nos próximos dias.</li>
            )}
          </ul>
        )}
      </section>

      {/* mensagens de estado */}
      {loading && <p>Carregando…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* TABELA PRO */}
      <TransactionsTable transacoes={transacoes} onEdit={abrirEditar} onDelete={excluir} />

      {/* botão flutuante */}
      <Button
        onClick={abrirNovo}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-3xl shadow-lg"
      >
        +
      </Button>

      {/* modal criar/editar */}
      <ModalTransacao
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        initialData={
          editando && {
            date: editando.date,
            description: editando.description,
            value: editando.value,
            type: editando.type,
            category: editando.category,
            payment_method: editando.payment_method,
          }
        }
        onSubmit={salvar}
      />
    </div>
  );
}