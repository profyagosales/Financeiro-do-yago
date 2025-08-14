import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import MilesHeader, { type MilesProgram } from '@/components/MilesHeader';
import PageHeader from '@/components/PageHeader';
import { MotionCard } from '@/components/ui/MotionCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Button } from '@/components/ui/button';
import ModalMilesMovement, { type MilesMovement } from '@/components/ModalMilesMovement';
import MilesPendingList from '@/components/miles/MilesPendingList';
import liveloLogo from '@/assets/logos/livelo.svg';
import latamLogo from '@/assets/logos/latampass.svg';
import azulLogo from '@/assets/logos/azul.svg';

import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');

export default function MilhasLivelo({ program = 'livelo' }: { program?: MilesProgram }) {
type Program = 'livelo' | 'latam' | 'azul';

const CONFIG: Record<Program, { title: string; gradient: string; logo: string }> = {
  livelo: {
    title: 'Milhas — Livelo',
    gradient: 'from-fuchsia-600 via-pink-500 to-rose-500',
    logo: liveloLogo,
  },
  latam: {
    title: 'Milhas — LATAM Pass',
    gradient: 'from-red-600 via-rose-600 to-purple-600',
    logo: latamLogo,
  },
  azul: {
    title: 'Milhas — Azul',
    gradient: 'from-sky-600 via-cyan-600 to-blue-600',
    logo: azulLogo,
  },
};

export default function MilhasLivelo({ program = 'livelo' }: { program?: Program }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<MilesMovement | null>(null);

  // MOCK local: depois conectamos no Supabase
  const [movs, setMovs] = useState<MilesMovement[]>([
    { id: '1', date: dayjs().date(2).format('YYYY-MM-DD'), kind: 'earn',   points: 1200, partner: 'Compra',   expires_at: dayjs().add(15,'day').format('YYYY-MM-DD') },
    { id: '2', date: dayjs().date(6).format('YYYY-MM-DD'), kind: 'redeem', points: 500,  partner: 'Resgate' },
    { id: '3', date: dayjs().subtract(1,'month').date(20).format('YYYY-MM-DD'), kind: 'earn', points: 3000, partner: 'Cartão' },
  ]);

  const saldo = useMemo(() => {
    const earned = movs.filter(m=>m.kind==='earn').reduce((s,m)=>s+m.points,0);
    const spent  = movs.filter(m=>m.kind==='redeem').reduce((s,m)=>s+m.points,0);
    return earned - spent;
  }, [movs]);

  const expira60 = useMemo(() => {
    const now = dayjs(); const limit = now.add(60,'day');
    return movs
      .filter(m=>m.kind==='earn' && m.expires_at && dayjs(m.expires_at).isAfter(now) && dayjs(m.expires_at).isBefore(limit))
      .reduce((s,m)=>s+m.points,0);
  }, [movs]);

  const thisMonth = useMemo(() => dayjs().format('YYYY-MM'), []);
  const ganhosMes = useMemo(() => movs.filter(m=>m.kind==='earn'   && m.date.startsWith(thisMonth)).reduce((s,m)=>s+m.points,0), [movs, thisMonth]);
  const resgMes  = useMemo(() => movs.filter(m=>m.kind==='redeem' && m.date.startsWith(thisMonth)).reduce((s,m)=>s+m.points,0), [movs, thisMonth]);

  const donut = useMemo(() => ([
    { name: 'Ganhos',   value: ganhosMes },
    { name: 'Resgates', value: resgMes  },
  ]), [ganhosMes, resgMes]);

  const addOrUpdate = async (d: Omit<MilesMovement,'id'>) => {
    if (edit) {
      setMovs(prev => prev.map(m => m.id===edit.id ? { ...edit, ...d } : m));
      toast.success('Movimento atualizado!');
    } else {
      setMovs(prev => [{ id: String(Date.now()), ...d }, ...prev]);
      toast.success('Movimento adicionado!');
    }
    setOpen(false); setEdit(null);
  };

  const remove = (id: string) => {
    setMovs(prev => prev.filter(m=>m.id!==id));
    toast.success('Excluído');
  };

  const cfg = CONFIG[program];

  return (
    <div className="space-y-6">
      <MilesHeader program={program} subtitle="Saldo, expiração e movimentos">
        <Button onClick={()=>{ setEdit(null); setOpen(true); }}>Novo movimento</Button>
      </MilesHeader>
      <MilesPendingList program={program} />
      <PageHeader
        title={cfg.title}
        subtitle="Saldo, a receber e expiração"
        gradient={cfg.gradient}
        logoSrc={cfg.logo}
        actions={<Button onClick={()=>{ setEdit(null); setOpen(true); }}>Novo movimento</Button>}
      />

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-4">
        <MotionCard><div><div className="text-sm text-slate-500">Saldo</div><AnimatedNumber value={saldo} currency={false} /></div></MotionCard>
        <MotionCard><div><div className="text-sm text-slate-500">Expira (60 dias)</div><AnimatedNumber value={expira60} currency={false} /></div></MotionCard>
        <MotionCard><div><div className="text-sm text-slate-500">Ganhos (mês)</div><AnimatedNumber value={ganhosMes} currency={false} /></div></MotionCard>
        <MotionCard><div><div className="text-sm text-slate-500">Resgates (mês)</div><AnimatedNumber value={-resgMes} currency={false} /></div></MotionCard>
      </section>

      {/* Donut mês */}
      <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
        <h3 className="font-medium mb-3">Movimentos no mês</h3>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={donut} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={2}>
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip formatter={(v:any)=>`${Number(v).toLocaleString('pt-BR')} pts`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela simples */}
      <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
        <h3 className="font-medium mb-3">Movimentos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr><th className="py-2">Data</th><th>Tipo</th><th>Pontos</th><th>Origem</th><th>Expira</th><th></th></tr>
            </thead>
            <tbody>
              {movs.map(m => (
                <tr key={m.id} className="border-t">
                  <td className="py-2">{dayjs(m.date).format('DD/MM/YYYY')}</td>
                  <td className={m.kind==='earn'?'text-emerald-600':'text-rose-600'}>{m.kind==='earn'?'Ganhos':'Resgates'}</td>
                  <td>{m.kind==='redeem' ? `- ${m.points}` : m.points}</td>
                  <td>{m.partner ?? '-'}</td>
                  <td>{m.expires_at ? dayjs(m.expires_at).format('DD/MM/YYYY') : '-'}</td>
                  <td className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={()=>{ setEdit(m); setOpen(true); }}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={()=>remove(m.id)}>Excluir</Button>
                  </td>
                </tr>
              ))}
              {movs.length===0 && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-500">Sem movimentos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalMilesMovement
        open={open}
        onClose={() => { setOpen(false); setEdit(null); }}
        initial={edit ?? undefined}
        onSubmit={addOrUpdate}
      />
    </div>
  );
}