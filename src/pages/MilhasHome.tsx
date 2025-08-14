import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';
import dayjs from 'dayjs';

import PageHeader from '@/components/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import MilesPendingList from '@/components/miles/MilesPendingList';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export default function MilhasHome() {
  const { user } = useAuth();
  const [pendingMonth, setPendingMonth] = useState(0);
  const saldoTotal = 12000;
  const ultimos = [
    { id: '1', programa: 'Livelo', pontos: 1200 },
    { id: '2', programa: 'LATAM Pass', pontos: -500 },
  ];

  useEffect(() => {
    async function load() {
      if (!user) return;
      const start = dayjs().startOf('month').format('YYYY-MM-DD');
      const end = dayjs().endOf('month').format('YYYY-MM-DD');
      const { data, error } = await supabase
        .from('miles')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gte('expected_at', start)
        .lte('expected_at', end);
      if (!error && data) {
        const total = data.reduce((sum, r) => sum + (r.amount ?? 0), 0);
        setPendingMonth(total);
      }
    }
    load();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Milhas"
        subtitle="Resumo geral e atalhos para programas"
        icon={<Plane className="h-5 w-5" />}
        actions={
          pendingMonth > 0 ? (
            <Badge variant="secondary">
              A receber: {pendingMonth.toLocaleString('pt-BR')} pts
            </Badge>
          ) : null
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription>Saldo total</CardDescription>
            <CardTitle>{saldoTotal.toLocaleString('pt-BR')} pts</CardTitle>
          </CardHeader>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-1">
            <CardDescription>Últimos lançamentos</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ul className="text-sm space-y-2">
              {ultimos.map((m) => (
                <li key={m.id} className="flex justify-between">
                  <span>{m.programa}</span>
                  <span>{m.pontos > 0 ? `+${m.pontos}` : m.pontos} pts</span>
                </li>
              ))}
              {ultimos.length === 0 && (
                <li className="text-muted-foreground">Sem lançamentos.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <MilesPendingList />

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/milhas/livelo" className="block">
          <Card className="hover:bg-muted/50">
            <CardHeader className="text-center">
              <CardTitle>Livelo</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/milhas/latampass" className="block">
          <Card className="hover:bg-muted/50">
            <CardHeader className="text-center">
              <CardTitle>LATAM Pass</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/milhas/azul" className="block">
          <Card className="hover:bg-muted/50">
            <CardHeader className="text-center">
              <CardTitle>Azul</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
