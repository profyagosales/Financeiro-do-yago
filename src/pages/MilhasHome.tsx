
import { Plane } from '@/components/icons';
// import { BRANDS } from '@/components/miles/brandConfig'; // não usado diretamente aqui
import { ProgramTabs } from '@/components/brand/ProgramTabs';
import { SectionChroming } from '@/components/layout/SectionChroming';
import MilesMonthlyTotals from '@/components/miles/MilesMonthlyTotals';
import MilesPendingList from '@/components/miles/MilesPendingList';
import MilesProgramCard from '@/components/miles/MilesProgramCard';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MilhasHome() {
  const saldoTotal = 12000;
  const ultimos = [
    { id: '1', programa: 'Livelo', pontos: 1200 },
    { id: '2', programa: 'LATAM Pass', pontos: -500 },
  ];

  return (
  <SectionChroming clr="milhas" className="space-y-6 pb-24">
      <PageHeader
        title="Milhas"
        subtitle="Resumo geral e atalhos para programas"
        icon={<Plane className="h-5 w-5" />}
      />

  {/* Tabs branding (links diretos) */}
  <ProgramTabs />

  {/* Cards dos programas */}
      <div className="grid gap-4 sm:grid-cols-3" aria-label="Programas de milhas" role="list">
        {(['livelo','latampass','azul'] as const).map(key => (
          <div role="listitem" key={key}>
            <MilesProgramCard program={key} />
          </div>
        ))}
      </div>

      {/* Resumo principal */}
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
                <li className="text-fg-muted">Sem lançamentos.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <MilesMonthlyTotals />

      <MilesPendingList />

  {/* (cards antigos removidos – substituídos pelos novos brand tabs no topo) */}
  </SectionChroming>
  );
}
