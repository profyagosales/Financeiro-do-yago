import { Plane } from 'lucide-react';
import { Link } from 'react-router-dom';

import PageHeader from '@/components/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function MilhasHome() {
  const saldoTotal = 12000;
  const ultimos = [
    { id: '1', programa: 'Livelo', pontos: 1200 },
    { id: '2', programa: 'LATAM Pass', pontos: -500 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Milhas"
        subtitle="Resumo geral e atalhos para programas"
        icon={<Plane className="h-5 w-5" />}
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/milhas/livelo" className="block">
          <Card className="hover:bg-muted/50">
            <CardHeader className="text-center">
              <CardTitle>Livelo</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/milhas/latam" className="block">
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
